import React from "react";
import "./App.css";

import Pagination from "./Pagination/Pagination";

export interface Category {
  name: string;
}

const categories: Category[] = [
  { name: "Javascript" },
  { name: "Python" },
  { name: "PHP" },
  { name: "Typescript" },
  { name: "C++" },
  { name: "C#" },
  { name: "PostgreSQL" },
  { name: "MySQL" },
  { name: "Very Big TEXT TEXT" },
];

function App() {
  function setCategory(category: Category): void {
    console.log(category.name);
  }
  return (
    <div className="App">
      <Pagination items={categories} onChange={setCategory} />
    </div>
  );
}

export default App;
