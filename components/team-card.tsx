"use client"

import Image from "next/image"
import { User } from "lucide-react"
import type { TeamMember } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"

interface TeamCardProps {
  member: TeamMember
}

export function TeamCard({ member }: TeamCardProps) {
  return (
    <div className="group relative flex flex-col gap-4 rounded-3xl border border-border bg-(--card) p-6 shadow-lg transition-all hover:shadow-xl">
      {/* Profile Image */}
      <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-2xl border-2 border-border">
        <Image
          src={member.img || "/placeholder.svg"}
          alt={member.name}
          fill
          className="object-cover"
          sizes="160px"
          style={{ objectPosition: member.imgPosition || "center" }}
        />
      </div>

      {/* Name and Role */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-(--text) mb-1">{member.name}</h3>
        <p className="text-sm text-(--muted)">{member.role}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-2">
        {member.bio && (
          <Dialog>
            <DialogTrigger asChild>
              <button className="rounded-full border border-border bg-(--bg) px-4 py-1.5 text-xs font-medium text-(--text) transition-all hover:border-primary hover:bg-(--primary-color)/10 hover:text-primary">
                Read Bio
              </button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] w-[calc(100%-2rem)] overflow-y-auto sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{member.name}</DialogTitle>
                <DialogDescription>{member.role}</DialogDescription>
              </DialogHeader>
              <p className="text-sm leading-relaxed text-muted-foreground">{member.bio}</p>
            </DialogContent>
          </Dialog>
        )}
        <div className="rounded-full border border-border bg-(--accent-color)/10 px-4 py-1.5 text-xs font-medium text-accent">
          <User className="inline h-3 w-3 mr-1" />
          {member.role}
        </div>
      </div>
    </div>
  )
}
