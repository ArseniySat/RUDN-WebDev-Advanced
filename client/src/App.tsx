import { BoardHeader } from "./components/BoardHeader/BoardHeader";
import { BoardColumn } from "./components/BoardColumn/BoardColumn";
import { NewCardForm } from "./components/NewCardForm/NewCardForm";
import styles from "./App.module.css";
import type { Card } from "./types/card";

const cards: Card[] = [
  { id: "1", title: "Изучить лекцию", isDone: true },
  { id: "2", title: "Выполнить семинар", isDone: false },
  { id: "3", title: "Отправить работу", isDone: false },
];

function App() {
  return (
    <div className={styles.app}>
      <BoardHeader />
      <main className={styles.board}>
        <NewCardForm />
        <div className={styles.columns}>
         <BoardColumn cards={cards} />
        </div>
      </main>
    </div>
  );
}

export default App;
