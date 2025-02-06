import { useEffect, useState } from "react";
import s from "./SearchLine.module.css";
import Triangle from "/src/assets/icons/triangle.svg?react";
import useClickOutside from "../../hooks/useClickOutside";

export interface SearchField {
  fieldName: string;
  fieldOptions: Array<string> | undefined;
}

export interface SearchLineProps {
  searchFields: Array<SearchField>;
  searchFunction: (field_index: number, value: string) => void;
}

const SearchLine: React.FunctionComponent<SearchLineProps> = ({
  searchFields,
  searchFunction,
}) => {
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const [value, setValue] = useState<string>("");

  const [showValueOptions, setShowValueOptions] = useState<boolean>(false);
  const [selectedValueIndex, setSelectedValueIndex] = useState<number>(0);

  useEffect(() => {
    setValue("");
    if (searchFields[selectedIndex].fieldOptions) {
      searchFunction(
        selectedIndex,
        searchFields[selectedIndex].fieldOptions[selectedValueIndex]
      );
    }
  }, [selectedIndex]);

  useEffect(() => {
    let checkRegex = /[-’/`~!#*$@_%+=.,^&(){}[\]|;:”<>?\\]/g;

    if (checkRegex.test(value) || value.length == 0) {
      searchFunction(selectedIndex, "");
      return;
    }

    searchFunction(selectedIndex, value);
  }, [value]);

  const selectRef = useClickOutside<HTMLDivElement>(() => {
    setShowOptions(false);
  });

  const selectValueRef = useClickOutside<HTMLDivElement>(() => {
    setShowValueOptions(false);
  });

  const onSelectClick = (value_option: boolean) => {
    if (!value_option) {
      setShowOptions(!showOptions);
    } else {
      setShowValueOptions(!showValueOptions);
    }
  };

  const onItemClick = (index: number, value_option: boolean) => {
    if (!value_option) {
      setSelectedIndex(index);
      setShowOptions(false);
      searchFunction(index, "");
    } else {
      setSelectedValueIndex((prev) => {
        return index;
      });
      setShowValueOptions(false);
      if (searchFields[selectedIndex].fieldOptions) {
        searchFunction(
          selectedIndex,
          searchFields[selectedIndex].fieldOptions[index]
        );
      }
    }
  };

  return (
    <div className={s.search_line_container}>
      <div ref={selectRef} className={s.select_relative_container}>
        <button
          className={s.select_container}
          onClick={() => onSelectClick(false)}
        >
          <p className={s.subtext}>{searchFields[selectedIndex].fieldName}</p>
          <Triangle className={s.triangle_svg} />
        </button>
        {showOptions && (
          <div className={s.select_options_container}>
            <ul className={s.list}>
              {searchFields.map((value, index) => (
                <li
                  className={`${s.subtext} ${s.list_item} ${
                    selectedIndex === index ? s.list_item_seleced : ""
                  }`}
                  key={index}
                  onClick={() => {
                    onItemClick(index, false);
                  }}
                >
                  {value.fieldName}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {!searchFields[selectedIndex].fieldOptions && (
        <input
          className={s.search_line_input}
          onChange={(e) => setValue(e.target.value)}
          value={value}
        />
      )}
      {searchFields[selectedIndex].fieldOptions && (
        <div ref={selectValueRef} className={s.select_relative_container}>
          <button
            className={s.select_container}
            onClick={() => onSelectClick(true)}
          >
            <p className={s.subtext}>
              {searchFields[selectedIndex].fieldOptions[selectedValueIndex]}
            </p>
            <Triangle className={s.triangle_svg} />
          </button>
          {showValueOptions && (
            <div className={s.select_options_container}>
              <ul className={s.list}>
                {searchFields[selectedIndex].fieldOptions.map(
                  (value, index) => (
                    <li
                      className={`${s.subtext} ${s.list_item} ${
                        selectedValueIndex === index ? s.list_item_seleced : ""
                      }`}
                      key={index + searchFields.length}
                      onClick={() => {
                        onItemClick(index, true);
                      }}
                    >
                      {value}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchLine;
