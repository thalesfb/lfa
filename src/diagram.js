export const groupTransitions = (states, coins, transition) => {
  const groups = new Map();

  for (const from of states) {
    for (const coin of coins) {
      const to = transition(from, coin);
      const key = `${from}→${to}`;
      const group = groups.get(key) ?? { from, to, coins: [] };
      group.coins.push(coin);
      groups.set(key, group);
    }
  }

  return [...groups.values()];
};
