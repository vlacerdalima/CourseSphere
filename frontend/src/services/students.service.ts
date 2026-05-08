export interface FakeStudent {
  id: string;
  name: string;
  avatarUrl: string;
}

export async function fetchStudents(seed: string, count: number = 8): Promise<FakeStudent[]> {
  const params = new URLSearchParams({
    seed: seed,
    results: String(count),
    inc: "login,name,picture",
    nat: "br,us,gb",
  });

  const response = await fetch(`https://randomuser.me/api/?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Falha ao carregar alunos");
  }

  const data = await response.json();
  return data.results.map((u: any) => ({
    id: u.login.uuid,
    name: `${u.name.first} ${u.name.last}`,
    avatarUrl: u.picture.medium,
  }));
}
