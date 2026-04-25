import { TeamMemberCard } from "./components/TeamMemberCard";
import { MovieWatchlist } from "./components/MovieWatchlist";

const team = [
  { id: 1, name: "Alice", role: "designer" as const, email: "alice@company.com", available: true },
  { id: 2, name: "Bob", role: "developer" as const, email: "bob@company.com", available: false },
  { id: 3, name: "Charlie", role: "manager" as const, email: "charlie@company.com", available: true },
  { id: 4, name: "Diana", role: "developer" as const, email: "diana@company.com" },
];

function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl space-y-12">
        <section>
          <h1 className="mb-6 text-3xl font-bold">Team</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {team.map((member) => (
              <TeamMemberCard
                key={member.id}
                name={member.name}
                role={member.role}
                email={member.email}
                available={member.available}
              />
            ))}
          </div>
        </section>

        <section>
          <MovieWatchlist />
        </section>
      </div>
    </div>
  );
}

export default App;
