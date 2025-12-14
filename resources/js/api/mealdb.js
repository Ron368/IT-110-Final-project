export async function mealdbSearch(term) {
  const res = await fetch(`/api/mealdb/search?s=${encodeURIComponent(term)}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`MealDB search failed (${res.status})`);
  return res.json();
}

export async function mealdbLookup(id) {
  const res = await fetch(`/api/mealdb/meal/${encodeURIComponent(id)}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`MealDB lookup failed (${res.status})`);
  return res.json();
}

export async function mealdbRandom() {
  const res = await fetch(`/api/mealdb/random`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`MealDB random failed (${res.status})`);
  return res.json();
}

export async function mealdbCategories() {
  const res = await fetch(`/api/mealdb/categories`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`MealDB categories failed (${res.status})`);
  return res.json();
}

// NEW:
export async function mealdbRandomBatch(count = 4) {
  const res = await fetch(`/api/mealdb/random-batch?count=${encodeURIComponent(count)}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`MealDB random batch failed (${res.status})`);
  return res.json();
}