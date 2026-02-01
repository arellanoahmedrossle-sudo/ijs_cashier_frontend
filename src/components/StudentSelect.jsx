import Select from "react-select";

const StudentSelect = ({ students = [], onChange }) => {
  // Map your student list into react-select options
  const options = students.map((s) => ({
    value: s._id,
    label: `${s.studentNo} | ${s.lastName}, ${s.firstName} (${s.email})`,
  }));

  return (
    <Select
      options={options}
      onChange={(opt) => onChange(opt.value)}
      placeholder="Search student..."
      isSearchable
      styles={{
        control: (base) => ({
          ...base,
          borderColor: "#009150",
          boxShadow: "none",
          "&:hover": { borderColor: "#009150" },
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isFocused ? "#e6f4ea" : "white",
          color: "#333",
        }),
      }}
    />
  );
};

export default StudentSelect;
