import {
    Empty,
    EmptyHeader,
    EmptyTitle,
    EmptyDescription,
    EmptyMedia,
} from "@/components/ui/empty"
import { Settings } from "lucide-react"

export default function AdminSettingsPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-semibold">Settings</h1>
                <p className="text-sm text-muted-foreground">
                    Configure options for the department admin console.
                </p>
            </div>
            <Empty className="border">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <Settings />
                    </EmptyMedia>
                    <EmptyTitle>No settings configured yet</EmptyTitle>
                    <EmptyDescription>
                        Configuration options will appear here as they are added.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        </div>
    )
}
