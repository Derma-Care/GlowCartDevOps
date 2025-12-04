// import React, { useMemo, useState } from 'react'

// // ClinicRatingsAdmin.jsx
// // Single-file React component (Tailwind CSS expected in project)
// // Features:
// // - Shows list of reviews (customer name, comment, rating, date)
// // - Shows overall rating, rating breakdown histogram
// // - Filters: by rating, search by customer name or comment text, date range
// // - Sort: newest/oldest/highest rating/lowest rating
// // - Preview modal (full comment) and CSV export
// // - Props: reviews (array) or will use sample data if not provided

// export default function ClinicRatingsAdmin({ reviews: propReviews = null }) {
//   // Sample data used if none passed in
//   const sample = [
//     {
//       id: 'r1',
//       name: 'Priya Sharma',
//       rating: 5,
//       comment: 'Great clinic — staff were friendly and punctual.',
//       date: '2025-11-20',
//     },
//     {
//       id: 'r2',
//       name: 'Amit Kumar',
//       rating: 4,
//       comment: 'Good service, waiting time was a bit long.',
//       date: '2025-10-27',
//     },
//     {
//       id: 'r3',
//       name: 'Leena Joshi',
//       rating: 3,
//       comment: 'Average experience. Doctor was good but reception was slow.',
//       date: '2025-09-05',
//     },
//     {
//       id: 'r4',
//       name: 'Ravi Patel',
//       rating: 1,
//       comment: 'Very disappointed with hygiene.',
//       date: '2025-08-18',
//     },
//     {
//       id: 'r5',
//       name: 'Sneha Menon',
//       rating: 5,
//       comment: 'Excellent follow-up and care.',
//       date: '2025-11-02',
//     },
//     {
//       id: 'r6',
//       name: 'Karan Singh',
//       rating: 4,
//       comment: 'Helpful staff — overall positive.',
//       date: '2025-07-19',
//     },
//     {
//       id: 'r7',
//       name: 'Meera Nair',
//       rating: 2,
//       comment: 'Long wait and communication could improve.',
//       date: '2025-06-25',
//     },
//   ]

//   const reviews = propReviews || sample

//   // UI state
//   const [query, setQuery] = useState('')
//   const [ratingFilter, setRatingFilter] = useState('all') // 'all' or 1..5
//   const [sort, setSort] = useState('newest')
//   const [selected, setSelected] = useState(null) // selected review for preview modal
//   const [page, setPage] = useState(1)
//   const pageSize = 6

//   // derived stats
//   const stats = useMemo(() => {
//     const total = reviews.length
//     const avg = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0
//     const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
//     for (const r of reviews) counts[r.rating] = (counts[r.rating] || 0) + 1
//     return { total, avg: Number(avg.toFixed(2)), counts }
//   }, [reviews])

//   // filtering
//   const filtered = useMemo(() => {
//     let list = reviews.slice()
//     if (ratingFilter !== 'all') {
//       list = list.filter((r) => r.rating === Number(ratingFilter))
//     }
//     if (query.trim()) {
//       const q = query.toLowerCase()
//       list = list.filter(
//         (r) =>
//           (r.name || '').toLowerCase().includes(q) || (r.comment || '').toLowerCase().includes(q),
//       )
//     }
//     // sorting
//     list.sort((a, b) => {
//       if (sort === 'newest') return new Date(b.date) - new Date(a.date)
//       if (sort === 'oldest') return new Date(a.date) - new Date(b.date)
//       if (sort === 'highest') return b.rating - a.rating
//       if (sort === 'lowest') return a.rating - b.rating
//       return 0
//     })
//     return list
//   }, [reviews, ratingFilter, query, sort])

//   // pagination
//   const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
//   const pageList = filtered.slice((page - 1) * pageSize, page * pageSize)

//   // helpers
//   const stars = (n) => {
//     const out = []
//     for (let i = 1; i <= 5; i++)
//       out.push(
//         <svg
//           key={i}
//           className={`w-4 h-4 inline-block ${i <= n ? 'text-yellow-400' : 'text-gray-300'}`}
//           viewBox="0 0 20 20"
//           fill="currentColor"
//           aria-hidden
//         >
//           <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.447a1 1 0 00-.364 1.118l1.287 3.96c.3.921-.755 1.688-1.54 1.118L10 15.347l-3.51 2.66c-.784.57-1.838-.197-1.539-1.118l1.286-3.96a1 1 0 00-.364-1.118L2.403 9.387c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.96z" />
//         </svg>,
//       )
//     return out
//   }

//   const exportCSV = () => {
//     const header = ['id', 'name', 'rating', 'comment', 'date']
//     const rows = filtered.map((r) => [
//       r.id,
//       r.name,
//       r.rating,
//       `"${(r.comment || '').replace(/"/g, '""')}"`,
//       r.date,
//     ])
//     const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n')
//     const blob = new Blob([csv], { type: 'text/csv' })
//     const url = URL.createObjectURL(blob)
//     const a = document.createElement('a')
//     a.href = url
//     a.download = `clinic_reviews_${new Date().toISOString().slice(0, 10)}.csv`
//     a.click()
//     URL.revokeObjectURL(url)
//   }

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <div className="max-w-6xl mx-auto">
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <h2 className="text-2xl font-semibold">Clinic Reviews & Ratings</h2>
//             <p className="text-sm text-gray-600">Manage and review customer feedback</p>
//           </div>
//           <div className="flex gap-3 items-center">
//             <button
//               onClick={exportCSV}
//               className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm"
//             >
//               Export CSV
//             </button>
//           </div>
//         </div>

//         {/* Top stats */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//           <div className="p-4 bg-white rounded-xl shadow-sm">
//             <div className="text-xs text-gray-500">Overall rating</div>
//             <div className="flex items-center gap-3 mt-2">
//               <div className="text-4xl font-bold">{stats.avg}</div>
//               <div>
//                 <div className="text-sm">{stats.total} reviews</div>
//                 <div className="mt-1">{stars(Math.round(stats.avg))}</div>
//               </div>
//             </div>
//           </div>

//           <div className="p-4 bg-white rounded-xl shadow-sm md:col-span-2">
//             <div className="text-xs text-gray-500">Rating breakdown</div>
//             <div className="mt-3 space-y-2">
//               {[5, 4, 3, 2, 1].map((r) => {
//                 const count = stats.counts[r] || 0
//                 const percent = stats.total ? Math.round((count / stats.total) * 100) : 0
//                 return (
//                   <div key={r} className="flex items-center gap-3">
//                     <div className="w-10 text-sm">{r}★</div>
//                     <div className="flex-1 bg-gray-100 h-3 rounded overflow-hidden">
//                       <div
//                         className="h-3 rounded"
//                         style={{
//                           width: `${percent}%`,
//                           background: 'linear-gradient(90deg,#f6ad55,#f59e0b)',
//                         }}
//                       />
//                     </div>
//                     <div className="w-12 text-sm text-right">{count}</div>
//                   </div>
//                 )
//               })}
//             </div>
//           </div>
//         </div>

//         {/* Filters */}
//         <div className="flex flex-col md:flex-row gap-3 items-start md:items-center mb-4">
//           <input
//             value={query}
//             onChange={(e) => {
//               setQuery(e.target.value)
//               setPage(1)
//             }}
//             placeholder="Search by customer or comment"
//             className="flex-1 px-3 py-2 rounded-md border"
//           />

//           <select
//             value={ratingFilter}
//             onChange={(e) => {
//               setRatingFilter(e.target.value)
//               setPage(1)
//             }}
//             className="px-3 py-2 rounded-md border"
//           >
//             <option value="all">All ratings</option>
//             <option value="5">5 stars</option>
//             <option value="4">4 stars</option>
//             <option value="3">3 stars</option>
//             <option value="2">2 stars</option>
//             <option value="1">1 star</option>
//           </select>

//           <select
//             value={sort}
//             onChange={(e) => {
//               setSort(e.target.value)
//             }}
//             className="px-3 py-2 rounded-md border"
//           >
//             <option value="newest">Newest</option>
//             <option value="oldest">Oldest</option>
//             <option value="highest">Highest rating</option>
//             <option value="lowest">Lowest rating</option>
//           </select>

//           <div className="ml-auto text-sm text-gray-600">
//             Showing <strong>{filtered.length}</strong> results
//           </div>
//         </div>

//         {/* Reviews list */}
//         <div className="space-y-3">
//           {pageList.map((r) => (
//             <div key={r.id} className="p-4 bg-white rounded-lg shadow-sm flex gap-4 items-start">
//               <div className="w-12 flex-shrink-0">
//                 <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold">
//                   {(r.name || 'U')
//                     .split(' ')
//                     .map((s) => s[0])
//                     .slice(0, 2)
//                     .join('')
//                     .toUpperCase()}
//                 </div>
//               </div>
//               <div className="flex-1">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <div className="font-medium">{r.name}</div>
//                     <div className="text-xs text-gray-500">
//                       {new Date(r.date).toLocaleDateString()}
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <div className="text-sm font-semibold">{r.rating} ★</div>
//                     <div className="mt-1">{stars(r.rating)}</div>
//                   </div>
//                 </div>
//                 <div className="mt-3 text-gray-700 line-clamp-2">{r.comment}</div>
//                 <div className="mt-3 flex items-center gap-2">
//                   <button
//                     onClick={() => setSelected(r)}
//                     className="text-sm px-3 py-1 rounded-md border"
//                   >
//                     Preview
//                   </button>
//                   <button
//                     onClick={() => {
//                       navigator.clipboard?.writeText(r.comment || '')
//                     }}
//                     className="text-sm px-3 py-1 rounded-md border"
//                   >
//                     Copy
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}

//           {filtered.length === 0 && (
//             <div className="p-6 bg-white rounded-lg text-center text-gray-500">
//               No reviews match your filters.
//             </div>
//           )}
//         </div>

//         {/* Pagination */}
//         <div className="mt-6 flex items-center justify-between">
//           <div className="text-sm text-gray-600">
//             Page {page} of {totalPages}
//           </div>
//           <div className="flex gap-2">
//             <button
//               onClick={() => setPage((p) => Math.max(1, p - 1))}
//               disabled={page === 1}
//               className="px-3 py-1 rounded-md border disabled:opacity-50"
//             >
//               Prev
//             </button>
//             <button
//               onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//               disabled={page === totalPages}
//               className="px-3 py-1 rounded-md border disabled:opacity-50"
//             >
//               Next
//             </button>
//           </div>
//         </div>

//         {/* Modal preview */}
//         {selected && (
//           <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//             <div className="bg-white max-w-xl w-full rounded-lg p-6">
//               <div className="flex items-start justify-between">
//                 <div>
//                   <div className="text-lg font-semibold">{selected.name}</div>
//                   <div className="text-sm text-gray-500">
//                     {new Date(selected.date).toLocaleDateString()} — {selected.rating} ★
//                   </div>
//                 </div>
//                 <button onClick={() => setSelected(null)} className="text-gray-500">
//                   Close
//                 </button>
//               </div>
//               <div className="mt-4 text-gray-700 whitespace-pre-line">{selected.comment}</div>
//               <div className="mt-6 flex justify-end">
//                 <button
//                   onClick={() => {
//                     setSelected(null)
//                   }}
//                   className="px-4 py-2 rounded-md border"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }
import React, { useMemo, useState } from 'react'
import '../CSS/ClinicRatingsAdmin.css'

export default function ClinicRatingsAdmin({ reviews: propReviews = null }) {
  const [copiedId, setCopiedId] = useState(null)

  // Sample fallback data
  const sample = [
    {
      id: 'r1',
      name: 'Priya Sharma',
      rating: 5,
      comment: 'Great clinic — staff were friendly and punctual.',
      date: '2025-11-20',
    },
    {
      id: 'r2',
      name: 'Amit Kumar',
      rating: 4,
      comment: 'Good service, waiting time was a bit long.',
      date: '2025-10-27',
    },
    {
      id: 'r3',
      name: 'Leena Joshi',
      rating: 3,
      comment: 'Average experience. Doctor was good but reception was slow.',
      date: '2025-09-05',
    },
    {
      id: 'r4',
      name: 'Ravi Patel',
      rating: 1,
      comment: 'Very disappointed with hygiene.',
      date: '2025-08-18',
    },
    {
      id: 'r5',
      name: 'Sneha Menon',
      rating: 5,
      comment: 'Excellent follow-up and care.',
      date: '2025-11-02',
    },
    {
      id: 'r6',
      name: 'Karan Singh',
      rating: 4,
      comment: 'Helpful staff — overall positive.',
      date: '2025-07-19',
    },
    {
      id: 'r7',
      name: 'Meera Nair',
      rating: 2,
      comment: 'Long wait and communication could improve.',
      date: '2025-06-25',
    },
  ]

  const reviews = propReviews || sample

  // UI State
  const [query, setQuery] = useState('')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [sort, setSort] = useState('newest')
  const [selected, setSelected] = useState(null)
  const [page, setPage] = useState(1)
  const pageSize = 6

  // Compute statistics
  const stats = useMemo(() => {
    const total = reviews.length
    const avg = total ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach((r) => counts[r.rating]++)
    return { total, avg: avg.toFixed(2), counts }
  }, [reviews])

  // Filtering + Sorting Logic
  const filtered = useMemo(() => {
    let list = [...reviews]

    if (ratingFilter !== 'all') {
      list = list.filter((r) => r.rating === Number(ratingFilter))
    }

    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (r) => r.name.toLowerCase().includes(q) || r.comment.toLowerCase().includes(q),
      )
    }

    list.sort((a, b) => {
      if (sort === 'newest') return new Date(b.date) - new Date(a.date)
      if (sort === 'oldest') return new Date(a.date) - new Date(b.date)
      if (sort === 'highest') return b.rating - a.rating
      if (sort === 'lowest') return a.rating - b.rating
      return 0
    })

    return list
  }, [reviews, query, ratingFilter, sort])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageList = filtered.slice((page - 1) * pageSize, page * pageSize)

  // Stars rendering
  const stars = (n) =>
    [...Array(5)].map((_, i) => (
      <span key={i} className={i < n ? 'star-filled' : 'star-empty'}>
        ★
      </span>
    ))

  // Export CSV
  const exportCSV = () => {
    const header = ['id', 'name', 'rating', 'comment', 'date']
    const rows = filtered.map((r) => [
      r.id,
      r.name,
      r.rating,
      `"${r.comment.replace(/"/g, '""')}"`,
      r.date,
    ])
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')

    a.href = url
    a.download = 'clinic_reviews.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="cr-container">
      {/* Header */}
      <div className="cr-header">
        <h2 style={{ color: 'var(--color-black)' }}>Clinic Reviews & Ratings</h2>
        <button
          className="btn"
          style={{ backgroundColor: 'var(--color-black)', color: 'white' }}
          onClick={exportCSV}
        >
          Export CSV
        </button>
      </div>

      {/* Stats Section */}
      <div className="cr-stats-grid">
        <div className="cr-card">
          <p className="label">Overall Rating</p>
          <h1>{stats.avg}</h1>
          <p>{stats.total} reviews</p>
          <div>{stars(Math.round(stats.avg))}</div>
        </div>

        <div className="cr-card">
          <p className="label">Rating Breakdown</p>
          {[5, 4, 3, 2, 1].map((star) => (
            <div className="cr-breakdown-row" key={star}>
              <span>{star}★</span>
              <div className="cr-bar">
                <div
                  className="cr-bar-fill"
                  style={{
                    width: `${stats.total ? (stats.counts[star] / stats.total) * 100 : 0}%`,
                  }}
                ></div>
              </div>
              <span>{stats.counts[star]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="cr-filters">
        <input
          className="cr-search"
          placeholder="Search by customer or comment"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setPage(1)
          }}
        />

        <select
          className="cr-filter-select"
          style={{ color: 'var(--color-black)' }}
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
        >
          <option value="all">All ratings</option>
          <option value="5">5 stars</option>
          <option value="4">4 stars</option>
          <option value="3">3 stars</option>
          <option value="2">2 stars</option>
          <option value="1">1 star</option>
        </select>

        <select
          className="cr-filter-select"
          style={{ color: 'var(--color-black)' }}
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="highest">Highest rating</option>
          <option value="lowest">Lowest rating</option>
        </select>

        <div className="cr-total-reviews" style={{ color: 'var(--color-black)' }}>
          Showing <strong>{filtered.length}</strong> results
        </div>
      </div>

      {/* Review List */}
      <div className="cr-list">
        {pageList.map((r) => (
          <div className="cr-review" key={r.id}>
            <div className="cr-avatar">{r.name.charAt(0).toUpperCase()}</div>

            <div className="cr-content">
              <div className="cr-review-header">
                <div>
                  <h4>{r.name}</h4>
                  <p className="cr-date">{new Date(r.date).toLocaleDateString()}</p>
                </div>

                <div className="cr-rating-right">
                  <span className="cr-rating-number">{r.rating} ★</span>
                  <div className="cr-rating-stars">{stars(r.rating)}</div>
                </div>
              </div>

              {/* COMMENT + COPY ICON */}
              <div className="cr-comment-row">
                <p className="cr-comment">{r.comment}</p>

                <span
                  className="cr-copy-icon"
                  title="Copy comment"
                  onClick={() => {
                    navigator.clipboard.writeText(r.comment)
                    setCopiedId(r.id)

                    setTimeout(() => setCopiedId(null), 1500) // hide after 1.5 sec
                  }}
                >
                  📋
                </span>

                {copiedId === r.id && <span className="cr-copied-text">Copied!</span>}
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && <p className="cr-no-results">No reviews found.</p>}
      </div>

      {/* Pagination */}
      <div className="cr-pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
          Next
        </button>
      </div>
    </div>
  )
}
