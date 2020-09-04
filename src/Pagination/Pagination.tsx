import React, { useEffect, useRef } from "react";
import { observable, action } from "mobx";
import { observer } from "mobx-react";
import { Category } from "../App";

import "./_Pagination.scss";

type storeBtn = { index: number; width: number; show: boolean };

class PaginationStore {
  @observable btns: storeBtn[] = [];
  @observable wrapEl: HTMLDivElement | null = null;
  @observable wrapElWidth = 100000;
  @observable currentIndex = 0;
  @observable availableBtns: number[] = [];

  @action setAvailableBtns(direction = true): void {
    const btns = [...this.btns];
    const hiddenBtns: number[] = [];
    let availableBtns: storeBtn[] = btns.filter((btn) => {
      return hiddenBtns.indexOf(btn.index) === -1;
    });

    const hideLast = (): number | null => {
      let result: number | null = null;
      availableBtns.reverse();
      for (const btn of availableBtns) {
        if (btn.index > this.currentIndex) {
          if (btn.show) {
            result = btn.index;
            break;
          }
        }
      }
      availableBtns.reverse();
      return result;
    };

    const hideFirst = (): number | null => {
      let result: number | null = null;
      for (const btn of availableBtns) {
        if (btn.index < this.currentIndex) {
          if (btn.show) {
            result = btn.index;
            break;
          }
        }
      }
      return result;
    };
    while (
      this.wrapElWidth <
      availableBtns
        .map((item) => item.width)
        .reduce((sum, current) => {
          return +sum + +current;
        }, 0)
    ) {
      let hiddenBtnIndex: number | null = null;
      if (direction) {
        hiddenBtnIndex = hideLast();
        if (hiddenBtnIndex == null) {
          hiddenBtnIndex = hideFirst();
        }
      } else {
        hiddenBtnIndex = hideFirst();
        if (hiddenBtnIndex == null) {
          hiddenBtnIndex = hideLast();
        }
      }
      if (hiddenBtnIndex != null) hiddenBtns.push(hiddenBtnIndex);
      availableBtns = btns.filter((btn) => {
        return hiddenBtns.indexOf(btn.index) === -1;
      });
    }

    this.availableBtns = availableBtns.map((btn) => btn.index);
  }

  @action setBtns(btns: storeBtn[]): void {
    this.btns = btns;
  }

  @action setWrapEl(el: HTMLDivElement | null): void {
    this.wrapEl = el;
  }

  @action setWindow() {
    if (typeof window == "object") {
      this.setWrapElWidth();
      // todo: make debounce function
      window.addEventListener("resize", this.setWrapElWidth);
    }
  }

  @action setWrapElWidth = () => {
    if (this.wrapEl) {
      this.wrapElWidth = this.wrapEl.clientWidth;

      console.log(this.btns);
      if (this.btns[0]) {
        this.setAvailableBtns();
      }
    }
  };

  @action goto = (index: number): number => {
    if (index >= this.btns.length) index = 0;
    if (index < 0) index = this.btns.length - 1;
    const direction: boolean = index > this.currentIndex;
    this.currentIndex = index;
    if (this.availableBtns.indexOf(index) === -1) {
      this.setAvailableBtns(direction);
    }
    return index;
  };
}

const paginationStore = new PaginationStore();

type PaginationProps = {
  items: Category[];
  onChange: (item: any) => void;
};

const Pagination: React.FC<PaginationProps> = observer(
  ({ items, onChange }) => {
    const objItems = items.map((item, i) => ({ instance: item, index: i }));
    const btnsRef = useRef(new Array(items.length));
    const wrapRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      paginationStore.setBtns(
        btnsRef.current.map((btn, i) => {
          return {
            index: i,
            width:
              btn.offsetWidth +
              parseInt(getComputedStyle(btn)["marginLeft"]) +
              parseInt(getComputedStyle(btn)["marginRight"]),
            show: true,
          };
        })
      );
      paginationStore.setWrapEl(wrapRef.current);
      paginationStore.setWindow();
    }, [btnsRef]);

    const showingItems = paginationStore.availableBtns.length
      ? objItems.filter(
          (item) => paginationStore.availableBtns?.indexOf(item.index) > -1
        )
      : objItems;

    function prev(): void {
      const nextIndex = paginationStore.goto(paginationStore.currentIndex - 1);
      const item = objItems.filter((item) => item.index === nextIndex)[0];
      onChange(item);
    }

    function next(): void {
      const nextIndex = paginationStore.goto(paginationStore.currentIndex + 1);
      const item = objItems.filter((item) => item.index === nextIndex)[0];
      onChange(item);
    }

    function change(index: number): void {
      paginationStore.goto(index);
      const item = objItems.filter((item) => item.index === index)[0];
      onChange(item);
    }

    return (
      <div className="pagination">
        <button
          className="pagination__btn pagination__btn--prev"
          onClick={prev}
        >
          Prev
        </button>
        <div className="pagination__middle" ref={wrapRef}>
          {showingItems.map((item) => {
            let className = "pagination__btn";
            if (item.index === paginationStore.currentIndex)
              className += " active";
            return (
              // eslint-disable-next-line react/jsx-key
              <button
                className={className}
                key={item.index}
                ref={(ref) => (btnsRef.current[item.index] = ref)}
                onClick={change.bind(null, item.index)}
              >
                {item.instance.name}
              </button>
            );
          })}
        </div>
        <button
          className="pagination__btn pagination__btn--next"
          onClick={next}
        >
          Next
        </button>
      </div>
    );
  }
);
export default Pagination;
