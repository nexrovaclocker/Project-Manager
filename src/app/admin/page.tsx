import { ClockPanel } from '@/components/ClockPanel'
import { NotesPanel } from '@/components/NotesPanel'
import { AdminPanel } from '@/components/AdminPanel'

export default function AdminPage() {
    return (
        <div className="p-6 h-full flex flex-col gap-6">
            <div className="flex flex-col lg:flex-row gap-6 lg:h-[500px] shrink-0">
                {/* Top Left: Clock */}
                <div className="w-full lg:w-1/3 flex flex-col border border-[var(--color-panel-border)] bg-[var(--color-panel)] relative h-full">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-green-accent)]"></div>
                    <ClockPanel />
                </div>

                {/* Top Right: Shared Notes */}
                <div className="w-full lg:w-2/3 flex flex-col border border-[var(--color-panel-border)] bg-[var(--color-panel)] relative h-full">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-green-accent)]"></div>
                    <NotesPanel />
                </div>
            </div>

            {/* Separator block */}
            <div className="flex items-center gap-4">
                <div className="h-px bg-red-500 flex-1"></div>
                <div className="text-red-500 font-bold tracking-widest text-sm uppercase">
                    // ADMIN_CONTROLS
                </div>
                <div className="h-px bg-red-500 flex-1"></div>
            </div>

            {/* Admin Block */}
            <div className="border border-[var(--color-panel-border)] bg-[var(--color-panel)] relative flex-1 min-h-[400px]">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
                <AdminPanel />
            </div>
        </div>
    )
}
