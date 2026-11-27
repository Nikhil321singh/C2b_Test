import PropTypes from 'prop-types'

// Same look as the other tables (e.g. Warehouse & Logistics): page count on
// the left, Previous / Next on the right, hidden when there is one page.
// `page` is 1-based.
const buttonClass = (disabled) =>
  `px-4 py-2 rounded-lg text-sm font-medium ${
    disabled ? 'bg-gray-400 text-gray-600 cursor-not-allowed' : 'bg-primary text-white'
  }`

const ListPagination = ({ page, pageSize, total, disabled, onPageChange }) => {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) {
    return null
  }
  const atFirst = disabled || page <= 1
  const atLast = disabled || page >= totalPages

  return (
    <div className='flex flex-col sm:flex-row items-center justify-between gap-3 mx-2 md:mx-5 my-4'>
      <span className='text-sm text-gray-600'>
        Page {page} of {totalPages}
      </span>
      <div className='flex gap-2'>
        <button
          type='button'
          disabled={atFirst}
          onClick={() => onPageChange(page - 1)}
          className={buttonClass(atFirst)}
        >
          Previous
        </button>
        <button
          type='button'
          disabled={atLast}
          onClick={() => onPageChange(page + 1)}
          className={buttonClass(atLast)}
        >
          Next
        </button>
      </div>
    </div>
  )
}

ListPagination.propTypes = {
  page: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  disabled: PropTypes.bool,
  onPageChange: PropTypes.func.isRequired,
}

export default ListPagination
