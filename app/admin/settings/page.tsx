import { Settings } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AdminSettingsPage() {
    return (
        <div className="flex flex-col gap-6">
            <AdminPageHeader
                section="System"
                title="Settings"
                description="Workspace configuration and administrative access."
                icon={Settings}
            />
            <div className="grid gap-4 lg:grid-cols-2">
                <Card className="border-border/70 shadow-sm">
                    <CardHeader>
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <CardTitle className="text-base">Workspace configuration</CardTitle>
                                <CardDescription className="mt-1">Department-wide preferences and defaults.</CardDescription>
                            </div>
                            <Badge variant="secondary">Not configured</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm leading-6 text-muted-foreground">
                            There are no editable workspace preferences yet. When settings become available, they will be managed here.
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-border/70 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base">Administrator access</CardTitle>
                        <CardDescription className="mt-1">Access is controlled through user roles.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm leading-6 text-muted-foreground">
                            Promote or demote administrators from the Users page. Your own account cannot be suspended or removed from this workspace.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
