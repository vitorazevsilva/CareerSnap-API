test('[JEST][1] - Validate Jest', () => {
  let number = null;
  expect(number).toBeNull();
  number = 10;
  expect(number).not.toBeNull();
  expect(number).toBe(10);
  expect(number).toEqual(10);
  expect(number).toBeGreaterThan(9);
  expect(number).toBeLessThan(11);
});

test('[JEST][2] - Validate objects', () => {
  const obj = { name: 'Vitor Silva', mail: 'vsilva@ipca.pt' };
  expect(obj).toHaveProperty('name');
  expect(obj).toHaveProperty('name', 'Vitor Silva');
  expect(obj.name).toBe('Vitor Silva');

  const obj2 = { name: 'Vitor Silva', mail: 'vsilva@ipca.pt' };
  expect(obj).toEqual(obj2);
  // expect(obj).toBe(obj2);
});
