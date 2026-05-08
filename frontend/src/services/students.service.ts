export interface FakeStudent {
  id: string;
  name: string;
  avatarUrl: string;
}

export async function fetchStudents(seed: string, count: number = 8): Promise<FakeStudent[]> {
  // Pedir 50% a mais para ter margem de deduplicação por URL de avatar
  const fetchCount = Math.min(count + Math.ceil(count * 0.5), 30);

  const params = new URLSearchParams({
    seed: seed,
    results: String(fetchCount),
    inc: "login,name,picture",
    nat: "br,us,gb,fr,de",
  });

  const response = await fetch(`https://randomuser.me/api/?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Falha ao carregar alunos");
  }

  const data = await response.json();

  const seen = new Set<string>();
  const unique: FakeStudent[] = [];

  for (const u of data.results) {
    const avatarUrl = u.picture.medium;
    if (seen.has(avatarUrl)) continue;
    seen.add(avatarUrl);
    unique.push({
      id: u.login.uuid,
      name: `${u.name.first} ${u.name.last}`,
      avatarUrl,
    });
    if (unique.length >= count) break;
  }

  return unique;
}
