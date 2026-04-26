type TeamMemberCardProps = {
  name: string;
  role: "designer" | "developer" | "manager";
  email: string;
  available?: boolean;
};

const roleStyles = {
  designer: "bg-purple-50 text-purple-700",
  developer: "bg-blue-50 text-blue-700",
  manager: "bg-green-50 text-green-700",
};

export function TeamMemberCard({
  name,
  role,
  email,
  available,
}: TeamMemberCardProps) {
  return (
    <div className="flex items-center gap-4 border rounded-lg p-4 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-lg font-medium text-gray-600">
        {name[0]}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold truncate">{name}</p>
          {available !== undefined && (
            <span
              className={`h-2 w-2 rounded-full ${available ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
            />
          )}
        </div>
        <p className="text-sm text-gray-500 truncate">{email}</p>
      </div>
      <span
        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${roleStyles[role]}`}
      >
        {role}
      </span>
    </div>
  );
}
