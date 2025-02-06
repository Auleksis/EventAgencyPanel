import { useEffect, useState } from "react";
import s from "./HintedSearchLine.module.css";
import useClickOutside from "../../hooks/useClickOutside";

export interface HintedSearchLine extends React.ComponentProps<"input"> {
  fetchFunction: (value: string) => Promise<Array<string>>;
  onItemSelected: (value: string, index: number) => void;
}

const HintedSearchLine: React.FunctionComponent<HintedSearchLine> = ({
  fetchFunction: searchFunction,
  onItemSelected,
  ...inputProps
}) => {
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [options, setOptions] = useState<Array<string>>([]);
  const [selected, setSelectd] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const [value, setValue] = useState<string>("");

  useEffect(() => {
    if (options.length > 0) {
      setValue(options[selectedIndex]);
      onItemSelected(options[selectedIndex], selectedIndex);
    }
  }, [selectedIndex]);

  const handleSearch = async () => {
    const fetched = await searchFunction(value);
    setOptions(fetched);
  };

  useEffect(() => {
    let checkRegex = /[-’/`~!#*$@_%+=.,^&{}[\]|;:”<>?\\]/g;

    if (checkRegex.test(value) || (value && value.length == 0)) {
      setShowOptions(false);
      onItemSelected("", -1);
      return;
    }

    if (selected) {
      setShowOptions(false);
    } else {
      setShowOptions(true);
    }

    handleSearch();
  }, [value]);

  const selectRef = useClickOutside<HTMLDivElement>(() => {
    setShowOptions(false);
  });

  const onItemClick = (index: number) => {
    setValue(() => {
      return options[index];
    });
    onItemSelected(options[index], index);

    setSelectd(true);
    setSelectedIndex(index);
    setShowOptions(false);
  };

  return (
    <div className={s.search_line_container}>
      <div ref={selectRef} className={s.select_relative_container}>
        <input
          className={s.select_container}
          onClick={() => {
            setShowOptions(true);
          }}
          onChange={(e) => {
            setValue(e.target.value);
            setSelectd(false);
          }}
          value={value}
          {...inputProps}
        />
        {showOptions && (
          <div className={s.select_options_container}>
            <ul className={s.list}>
              {options.map((value, index) => (
                <li
                  className={`${s.subtext} ${s.list_item} ${
                    selectedIndex === index ? s.list_item_seleced : ""
                  }`}
                  key={index}
                  onClick={() => {
                    onItemClick(index);
                  }}
                >
                  {value}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default HintedSearchLine;
