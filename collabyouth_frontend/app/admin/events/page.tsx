"use client";

export default function AdminEventsPage() {
  return (
    <>
      <header className="h-14 border-b border-gray-200 bg-white flex items-center px-8 shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-gray-900">Events</h1>
          <p className="text-xs text-gray-400">Manage platform events</p>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-2xl mx-auto mb-4">
            📅
          </div>
          <p className="text-sm font-semibold text-gray-700 mb-1">Events coming soon</p>
          <p className="text-xs text-gray-400">This section will be available once the events API is ready.</p>
        </div>
      </div>
    </>
  );
}