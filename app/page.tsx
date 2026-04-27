'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 dark:bg-black">
      <div className="bg-white dark:bg-zinc-900 p-10 rounded-2xl shadow-lg text-center w-full max-w-md">

        <h1 className="text-3xl font-bold mb-4">
          📦 WMS System
        </h1>

        <p className="text-zinc-500 mb-8">
          ระบบจัดการคลังสินค้า (Warehouse Management System)
        </p>

        <div className="flex flex-col gap-4">

          {/* Dashboard */}
          <Link href="/dashboard">
            <button className="w-full py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition">
              📊 Dashboard
            </button>
          </Link>

          {/* Transactions */}
          <Link href="/transactions">
            <button className="w-full py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition">
              📑 Transactions
            </button>
          </Link>

        </div>

      </div>
    </div>
  )
}