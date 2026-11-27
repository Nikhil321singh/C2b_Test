import PropTypes from 'prop-types'
import { PAGE_SIZES } from './listPaging'

const BUTTON =
  'border border-primary text-primary px-3 py-1 rounded-md disabled:opacity-40 disabled:cursor-not-allowed'

// Pager under a server-paged table. `page` is 1-based.
const ListPagination = ({ page, limit, total, disabled, onPageChange, onLimitChange }) => {
  const pages = Math.max(Math.ceil(total / limit), 1)
  const from = total === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <div className='flex flex-wrap items-center justify-between gap-3 mx-2 md:mx-5 mb-6 text-sm'>
      <p className='text-gray-600'>
        Showing {from}–{to} of {total}
      </p>
      <div className='flex flex-wrap items-center gap-2'>
        <label className='flex items-center gap-1 text-gray-600'>
          Rows
          <select
            value={limit}
            disabled={disabled}
            onChange={(event) => onLimitChange(Number(event.target.value))}
            className='border border-gray-300 rounded-md px-2 py-1'
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <button
          type='button'
          className={BUTTON}
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>
        <span className='whitespace-nowrap'>
          Page {page} of {pages}
        </span>
        <button
          type='button'
          className={BUTTON}
          disabled={disabled || page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  )
}

ListPagination.propTypes = {
  page: PropTypes.number.isRequired,
  limit: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  disabled: PropTypes.bool,
  onPageChange: PropTypes.func.isRequired,
  onLimitChange: PropTypes.func.isRequired,
}

export default ListPagination
