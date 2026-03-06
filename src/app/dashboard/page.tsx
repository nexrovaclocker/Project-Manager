import { ClockPanel } from '@/components/ClockPanel'
import { NotesPanel } from '@/components/NotesPanel'

export default function DashboardPage() {
    return (
        <div className="h-full flex flex-col lg:flex-row p-6 gap-6">
            {/* Left Panel: Clock */}
            <div className="w-full lg:w-1/3 flex flex-col border border-[var(--color-panel-border)] bg-[var(--color-panel)] relative h-full">
                <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-panel-border)]"></div>
                <ClockPanel />
            </div>

            {/* Right Panel: Shared Notes */}
            <div className="w-full lg:w-2/3 flex flex-col border border-[var(--color-panel-border)] bg-[var(--color-panel)] relative h-full">
                <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-panel-border)]"></div>
                <NotesPanel />
            </div>
        </div>
    )
}
