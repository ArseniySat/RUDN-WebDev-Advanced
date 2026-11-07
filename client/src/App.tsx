import { useQuery } from "@tanstack/react-query";
import { fetchCards } from "./api/cards";
import { BoardHeader } from "./components/BoardHeader/BoardHeader";
import { BoardColumn } from "./components/BoardColumn/BoardColumn";
import { NewCardForm } from "./components/NewCardForm/NewCardForm";
import styles from "./App.module.css";

function App() {
  const { data: cards = [], isLoading, isError } = useQuery({
    queryKey: ["cards"],
    queryFn: fetchCards,
  });

  return (
    <div className={styles.app}>
      <BoardHeader />
      <main className={styles.board}>
        <NewCardForm />
        <div className={styles.columns}>
          {isLoading ? (
            <p>Загрузка…</p>
          ) : isError ? (
            <p>Не удалось загрузить карточки.</p>
          ) : (
            <BoardColumn cards={cards} onDelete={() => {}} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
