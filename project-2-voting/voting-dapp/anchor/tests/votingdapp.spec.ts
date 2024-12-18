import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { Voting } from "anchor/target/types/voting";
import { BankrunProvider } from "anchor-bankrun";
import { startAnchor } from "solana-bankrun";

const IDL = require("../target/idl/voting.json");

const votingAddress = new PublicKey(
  "coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF"
);

const test = it;

describe("Voting", () => {
  test("Initialize Poll", async () => {
    const context = await startAnchor(
      "",
      [{ name: "voting", programId: votingAddress }],
      []
    );
    const provider = new BankrunProvider(context);

    const votingProgram = new Program<Voting>(IDL, provider);

    await votingProgram.methods
      .initializePoll(
        new anchor.BN(1),
        "what is your favorite type of peanut butter?",
        new anchor.BN(0),
        new anchor.BN(1821246480),
        new anchor.BN(0)
      )
      .rpc();

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8)],
      votingAddress
    );

    const poll = await votingProgram.account.poll.fetch(pollAddress);

    expect(poll.pollId.toNumber()).toEqual(1);
    expect(poll.description).toEqual(
      "what is your favorite type of peanut butter?"
    );
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber());
  });
});
