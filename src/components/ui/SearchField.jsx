import { FiSearch } from 'react-icons/fi'
export default function SearchField({ value, onChange, placeholder='Search...' }) { return <label className="approval-search search-field"><span className="sr-only">Search</span><FiSearch/><input placeholder={placeholder} value={value} onChange={onChange}/></label> }
