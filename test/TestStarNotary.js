const StarNotary = artifacts.require("StarNotary");

let accounts;
let owner;

contract("StarNotary", (accs) => {
  accounts = accs;
  owner = accounts[0];
});

it("can Create a Star", async () => {
  const instance = await StarNotary.deployed();
  const tokenId = 1;
  await instance.createStar("Jake Test Star", tokenId, { from: owner });
  assert.equal(
    await instance.tokenIdToStarInfo.call(tokenId),
    "Jake Test Star"
  );
});

it("let user1 put up their star for sale", async () => {
  const instance = await StarNotary.deployed();
  const user1 = accounts[1];
  const starId = 2;
  const starPrice = web3.utils.toWei("0.01", "ether");
  await instance.createStar("Star for sale", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it("lets user1 get the funds after the sale", async () => {
  const instance = await StarNotary.deployed();
  const user1 = accounts[1];
  const user2 = accounts[2];
  let starId = 3;
  let starPrice = web3.utils.toWei("0.01", "ether");
  let balance = web3.utils.toWei("0.05", "ether");
  await instance.createStar("A third star for sale", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  const balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
  await instance.buyStar(starId, { from: user2, value: balance });
  const balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
  const value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
  const value2 = Number(balanceOfUser1AfterTransaction);
  assert.equal(value1, value2);
});

it("lets user2 buy a star, if it is put up for sale", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 4;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  await instance.buyStar(starId, { from: user2, value: balance });
  assert.equal(await instance.ownerOf.call(starId), user2);
});

it("lets user2 buy a star and decreases its balance in ether", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 5;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
  await instance.buyStar(starId, { from: user2, value: balance, gasPrice: 0 });
  const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
  let value =
    Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
  assert.equal(value, starPrice);
});

it("has a token name", async () => {
  let instance = await StarNotary.deployed();
  assert.equal(await instance.name.call(), "Claim Starz");
});

it("has a token symbol", async () => {
  let instance = await StarNotary.deployed();
  assert.equal(await instance.symbol.call(), "STRZ");
});

it("lookUptokenIdToStarInfo test", async () => {
  let instance = await StarNotary.deployed();
  const user1 = accounts[1];
  // 1. create a Star with different tokenId
  const starId = 6;
  await instance.createStar("Alpha Centauri", starId, { from: user1 });
  // 2. Call your method lookUptokenIdToStarInfo
  const starName = await instance.lookUptokenIdToStarInfo(starId);
  // 3. Verify if you Star name is the same
  assert.equal(starName, "Alpha Centauri");
});

it("can tell owner of a star", async () => {
  let instance = await StarNotary.deployed();
  const user2 = accounts[2];
  const ownerOfStar3 = await instance.ownerOf(3);
  assert.equal(user2, ownerOfStar3);
});

it("lets 2 users exchange stars", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let star1Id = 11;
  let user2 = accounts[2];
  let star2Id = 22;
  let balance = web3.utils.toWei(".05", "ether");
  // 1. create 2 Stars with different tokenId
  await instance.createStar("Vega", star1Id, { from: user1 });
  assert.equal(await instance.ownerOf(star1Id), user1);
  await instance.createStar("Pleiades", star2Id, { from: user2 });
  assert.equal(await instance.ownerOf(star2Id), user2);
  // // 2. Call the exchangeStars functions implemented in the Smart Contract
  await instance.exchangeStars(star1Id, star2Id, { from: user1 });
  // // 3. Verify that the owners changed
  assert.equal(await instance.ownerOf(star2Id), user1);
  assert.equal(await instance.ownerOf(star1Id), user2);
});

it("lets a user transfer a star", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 33;
  // 1. create a Star with different tokenId
  await instance.createStar("Antares", starId, { from: user1 });
  assert.equal(await instance.ownerOf(starId), user1);
  // 2. use the transferStar function implemented in the Smart Contract
  await instance.transferStar(user2, starId, { from: user1 });
  // 3. Verify the star owner changed.
  assert.equal(await instance.ownerOf(starId), user2);
});
