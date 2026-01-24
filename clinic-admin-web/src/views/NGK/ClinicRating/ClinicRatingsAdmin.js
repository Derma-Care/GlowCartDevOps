/* eslint-disable prettier/prettier */
import React, { useEffect, useMemo, useState } from 'react'
import '../CSS/ClinicRatingsAdmin.css'
import axios from 'axios'
import { BASE_URL } from '../../../baseUrl'
import { timeAgo } from '../Utills/timesAgo'
import { COLORS, NGK_COLORS } from '../../../Constant/Themes'
import Pagination from '../../../Utils/Pagination'

// eslint-disable-next-line react/prop-types
export default function ClinicRatingsAdmin() {
  const [reviews, setReviews] = useState([])
  const [statsApi, setStatsApi] = useState({ avg: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState(null)

  // UI State
  const [query, setQuery] = useState('')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const clinicId = localStorage.getItem('HospitalId')
  useEffect(() => {
    setPage(1)
  }, [pageSize])

  /* ---------------- FETCH RATINGS ---------------- */
  useEffect(() => {
    if (!clinicId) return

    const fetchRatings = async () => {
      try {
        setLoading(true)

        const res = await axios.get(`${BASE_URL}/ratings/${clinicId}`)

        const apiData = res.data?.data
        console.log(apiData)
        // 🔁 Transform backend data → UI format
        const mappedReviews =
          apiData?.ratings?.map((r) => ({
            id: r.bookingId,
            name: r.fullName?.trim() || 'Anonymous',
            rating: Number(r.rating) || 0,
            comment: r.review?.trim() || 'No review provided',
            date: r.createdAt,
          })) || []

        setReviews(mappedReviews)
        setStatsApi({
          avg: apiData?.averageRating ?? 0,
          total: apiData?.totalRatings ?? 0,
        })
      } catch (err) {
        console.error('Failed to fetch clinic ratings', err)
        setReviews([])
      } finally {
        setLoading(false)
      }
    }

    fetchRatings()
  }, [clinicId])

  /* ---------------- FILTER + SORT ---------------- */
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

  /* ---------------- PAGINATION ---------------- */
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageList = filtered.slice((page - 1) * pageSize, page * pageSize)

  /* ---------------- STATS ---------------- */
const stats = useMemo(() => {
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }

  reviews.forEach((r) => {
    if (counts[r.rating] !== undefined) {
      counts[r.rating]++
    }
  })

  const total = reviews.length // ✅ FIX

  return {
    avg: total ? (statsApi.avg || 0).toFixed(1) : '0.0',
    total,
    counts,
  }
}, [reviews, statsApi])


  /* ---------------- STARS ---------------- */
  const stars = (n) =>
    [...Array(5)].map((_, i) => (
      <span key={i} className={i < n ? 'star-filled' : 'star-empty'}>
        ★
      </span>
    ))

  /* ---------------- CSV EXPORT ---------------- */
  const exportCSV = () => {
    const header = ['Name', 'Rating', 'Comment', 'Date']
    const rows = filtered.map((r) => [
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

  /* ---------------- UI ---------------- */
  if (loading) {
    return <p className="cr-loading">Loading reviews...</p>
  }

  return (
    <div className="cr-container">
      {/* Header */}
      <div className="cr-header">
        <h2 style={{ color: 'var(--color-black)' }}>Clinic Reviews & Ratings</h2>
        <button
          className="btn"
          onClick={exportCSV}
          style={{ backgroundColor: 'var(--color-bgcolor)', color: 'var(--color-black)' }}
        >
          Export CSV
        </button>
      </div>

      {/* Stats */}
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
            width: stats.total
              ? `${(stats.counts[star] / stats.total) * 100}%`
              : '0%',
          }}
        />
      </div>

      <span>{stats.counts[star]}</span>
    </div>
  ))}
</div>

      </div>

      {/* Filters */}
      <div className="cr-filters">
        {/* Search */}
        <input
          className="cr-search"
          placeholder="Search by customer or comment"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setPage(1)
          }}
        />

        {/* Rating Filter */}
        <select
          className="cr-filter-select"
          value={ratingFilter}
          onChange={(e) => {
            setRatingFilter(e.target.value)
            setPage(1)
          }}
        >
          <option value="all">All ratings</option>
          <option value="5">5 stars</option>
          <option value="4">4 stars</option>
          <option value="3">3 stars</option>
          <option value="2">2 stars</option>
          <option value="1">1 star</option>
        </select>

        {/* Sort */}
        <select
          className="cr-filter-select"
          value={sort}
          onChange={(e) => {
            setSort(e.target.value)
            setPage(1)
          }}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="highest">Highest rating</option>
          <option value="lowest">Lowest rating</option>
        </select>

        {/* Result Count */}
        <div className="cr-total-reviews">
          Showing <strong>{filtered.length}</strong> results
        </div>
      </div>

      {/* Review List */}
      <div className="cr-list">
        {pageList.map((r) => (
          <div className="cr-review" key={r.id}>
            <div className="cr-avatar">{(r.name || 'A').charAt(0).toUpperCase()}</div>

            <div className="cr-content">
              <div className="cr-review-header">
                <div>
                  <h4>{r.name}</h4>
                  <p className="cr-date text-muted" title={new Date(r.date).toLocaleString()}>
                    {timeAgo(r.date)}
                  </p>
                </div>

                <div className="cr-rating-right">
                  <div style={{ color: 'var(--color-black)' }}>{r.rating} ★</div>
                  {stars(r.rating)}
                </div>
              </div>

              <div className="cr-comment-row ">
                <p className="text-muted">{r.comment}</p>
                <span
                  className="cr-copy-icon"
                  onClick={() => {
                    navigator.clipboard.writeText(r.comment)
                    setCopiedId(r.id)
                    setTimeout(() => setCopiedId(null), 1500)
                  }}
                >
                  📋
                </span>
                {copiedId === r.id && <span>Copied!</span>}
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && <p className="cr-no-results">No reviews found.</p>}
      </div>

      {/* Pagination */}

      {filtered.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize} // ✅ REQUIRED
        />
      )}

      {/* <div className="cr-pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
          Next
        </button>
      </div> */}
    </div>
  )
}
