// Quick test script for the 15-minute grace pricing logic
function calculatedCost(hours) {
  // tiers
  const tiers = [
    { h: 1, price: 15 },
    { h: 2, price: 25 },
    { h: 3, price: 30 },
    { h: 4, price: 35 },
    { h: 6, price: 50 },
    { h: 8, price: 70 },
    { h: 12, price: 80 },
  ];
  const GRACE_HOURS = 15 / 60; // 0.25
  for (let i = 0; i < tiers.length; i++) {
    const t = tiers[i];
    if (hours <= t.h + GRACE_HOURS) return t.price;
  }
  const last = tiers[tiers.length - 1];
  if (hours <= last.h + GRACE_HOURS) return last.price;
  const extra = hours - last.h;
  const effective = Math.max(0, extra - GRACE_HOURS);
  const extraUnits = Math.ceil(effective / 1);
  return last.price + extraUnits * 10;
}

const tests = [
  { label: '0:00', h: 0 },
  { label: '0:07', h: 7/60 },
  { label: '0:14', h: 14/60 },
  { label: '0:15', h: 15/60 },
  { label: '0:16', h: 16/60 },
  { label: '1:00', h: 1 },
  { label: '1:10', h: 70/60 },
  { label: '2:00', h: 2 },
  { label: '3:00', h: 3 },
  { label: '3:07', h: (3*60+7)/60 },
  { label: '3:20', h: (3*60+20)/60 },
  { label: '4:00', h: 4 },
  { label: '6:00', h: 6 },
  { label: '6:14', h: (6*60+14)/60 },
  { label: '6:16', h: (6*60+16)/60 },
  { label: '8:00', h: 8 },
  { label: '8:10', h: (8*60+10)/60 },
  { label: '8:16', h: (8*60+16)/60 },
  { label: '12:00', h: 12 },
  { label: '12:10', h: (12*60+10)/60 },
  { label: '12:18', h: (12*60+18)/60 },
  { label: '13:00', h: 13 },
  { label: '13:10', h: (13*60+10)/60 },
];

console.log('Testing calculatedCost with 15-minute grace:\n');
tests.forEach(t => {
  console.log(`${t.label.padEnd(6)} -> ${calculatedCost(t.h)}$`);
});
