const SearchInput = ({ searchQuery, handleSearchChange }) => {
  return (
    <div className="form-group mb-3">
      <input
        type="text"
        className="form-control w-25"
        placeholder="Search notes"
        value={searchQuery}
        onChange={handleSearchChange}
      />
    </div>
  );
};

export default SearchInput;
