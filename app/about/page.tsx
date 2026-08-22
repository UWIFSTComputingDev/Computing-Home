import { desc, eq, isNotNull } from "drizzle-orm"

import { TeamCard } from "@/components/team-card"
import { db } from "@/db"
import { profiles, users } from "@/db/schema"
import type { TeamMember } from "@/lib/types"

export const dynamic = "force-dynamic"

async function getCommitteeMembers(): Promise<TeamMember[]> {
  const rows = await db
    .select({
      id: users.id,
      displayName: profiles.displayName,
      avatarUrl: profiles.avatarUrl,
      position: profiles.position,
      bio: profiles.bio,
    })
    .from(profiles)
    .innerJoin(users, eq(profiles.userId, users.id))
    .where(isNotNull(profiles.position))
    .orderBy(desc(profiles.updatedAt))

  return rows.map((row) => ({
    id: row.id,
    name: row.displayName,
    role: row.position ?? "",
    img: row.avatarUrl || "/placeholder-user.jpg",
    bio: row.bio ?? "",
  }))
}

export default async function AboutPage() {
  const teamMembers = await getCommitteeMembers()

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Header Section */}
        <section className="border-b/20 border-border bg-linear-to-b from-(--bg)/70 to-(--card)/10">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-(--text) sm:text-5xl text-balance">
                About Us
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-(--muted) leading-relaxed text-pretty">
                We are the Computing Subcommittee, a group of passionate students dedicated to promoting technology, innovation, and collaboration within the Faculty of Science and Technology. Our goal is to create opportunities for learning, leadership, and community impact through computing-driven initiatives and events.
              </p>
            </div>
          </div>
        </section>

        {/* Team Grid Section */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {teamMembers.length === 0 ? (
              <p className="text-center text-(--muted)">
                Committee members will appear here once they are assigned a position.
              </p>
            ) : (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {teamMembers.map((member) => (
                  <TeamCard key={member.id} member={member} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
