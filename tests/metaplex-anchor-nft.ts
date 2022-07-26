import * as anchor from "@project-serum/anchor";
import { Program, Wallet } from "@project-serum/anchor";
import { MetaplexAnchorNft } from "../target/types/metaplex_anchor_nft";
import {
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createInitializeMintInstruction,
  MINT_SIZE,
} from "@solana/spl-token"; // IGNORE THESE ERRORS IF ANY
const { SystemProgram } = anchor.web3;

describe("metaplex-anchor-nft",  () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  const wallet = provider.wallet as Wallet;
  anchor.setProvider(provider);
  const program = anchor.workspace
    .MetaplexAnchorNft as Program<MetaplexAnchorNft>;
  it("Is initialized!", async () => {
    const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
      "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
    );
    
    const lamports: number =
      await program.provider.connection.getMinimumBalanceForRentExemption(
        MINT_SIZE
      );
    const getMetadata = async (
      mint: anchor.web3.PublicKey
    ): Promise<anchor.web3.PublicKey> => {
      return (
        await anchor.web3.PublicKey.findProgramAddress(
          [
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mint.toBuffer(),
          ],
          TOKEN_METADATA_PROGRAM_ID
        )
      )[0];
    };

    const getMasterEdition = async (
      mint: anchor.web3.PublicKey
    ): Promise<anchor.web3.PublicKey> => {
      return (
        await anchor.web3.PublicKey.findProgramAddress(
          [
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mint.toBuffer(),
            Buffer.from("edition"),
          ],
          TOKEN_METADATA_PROGRAM_ID
        )
      )[0];
    };
      const mintKey: anchor.web3.Keypair = anchor.web3.Keypair.generate();
      const NftTokenAccount = await getAssociatedTokenAddress(
      mintKey.publicKey,
      wallet.publicKey
    );
    console.log("NFT Account: ", NftTokenAccount.toBase58());
console.log(wallet.publicKey.toBase58())
console.log(mintKey.publicKey.toBase58())
    const mint_tx = new anchor.web3.Transaction().add(
      anchor.web3.SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mintKey.publicKey,
        space: MINT_SIZE,
        programId: TOKEN_PROGRAM_ID,
        lamports,
      }),
      createInitializeMintInstruction(
        mintKey.publicKey,
        0,
        wallet.publicKey,
        wallet.publicKey
      ),
      createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        NftTokenAccount,
        wallet.publicKey,
        mintKey.publicKey
      )
    );
    
    const res = await program.provider.sendAndConfirm(mint_tx, [mintKey]);
    console.log({res})
/*
    console.log(
      await program.provider.connection.getParsedAccountInfo(mintKey.publicKey)
    );

    console.log("Account: ", res);
    console.log("Mint key: ", mintKey.publicKey.toString());
    console.log("User: ", wallet.publicKey.toString());
*/
    const metadataAddress = await getMetadata(mintKey.publicKey);
    const masterEdition = await getMasterEdition(mintKey.publicKey);

    console.log("Metadata address: ", metadataAddress.toBase58());
    console.log("MasterEdition: ", masterEdition.toBase58());
/*
    const tx2 = await program.methods
      .setCollection()
      .accounts({
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
          metadata: metadataAddress,
          collectionAuthority: wallet.publicKey,
          payer: wallet.publicKey,
          updateAuthority : wallet.publicKey,
          collectionMint: mintKey.publicKey,
          collectionMetadata : "MHuiXt7CvHxT6rGo9qjwrxGt7hA6TeEFkVnzzunMQTT",
          collectionMasterEdition : masterEdition,
          collectionAuthorityRecord:  anchor.web3.Keypair.generate().publicKey,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY
        })
        .signers([wallet.payer])
      .rpc();
    console.log("Your transaction signature", tx2);
*/
    const tx = await program.methods
      .mintNft(
        mintKey.publicKey,
        "https://shdw-drive.genesysgo.net/EqmeTsso1xKzWzhpanTq3efZgJETwzUw4cWgX3AtgpE2/4.json",
        "Adventurer #4"
      )
      .accounts({
        mintAuthority: wallet.publicKey,
        mint: mintKey.publicKey,
        tokenAccount: NftTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        metadata: metadataAddress,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        payer: wallet.publicKey,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        masterEdition: masterEdition,
        collection: new anchor.web3.PublicKey("Cum9c21M61JSdLZYYguQDNiQbDzgm8dfcWUR9R3NuTgB")
      })
      .rpc();
    console.log("Your transaction signature", tx);
  });
});
