import { useState, useRef, useCallback, useEffect } from 'react';
import produce from 'immer';
import TodoTemplate from './TodoTemplate';
import TodoInsert from './TodoInsert';
import TodoList from './TodoList';
import firebase from '../../module/firebaseApi';


const Todo = () => {
  const [todos, setTodos] = useState([]);
  const nextId = useRef(1);
  
  useEffect(() => { //제일 처음 db와 동기화, 스냅샷 저장, id값 불러오기
    firebase.updateData((todoList) => {
      setTodos(todoList);
      todoList.forEach((todo) => {
        if (todo.id >= nextId.current) nextId.current = todo.id + 1;
      }) 
    })
  }, []);

  const onInsert = useCallback((text) => {  //todo 추가
    const todo = {
      id: nextId.current,
      text,
      checked: false,
    };

    firebase.addData(todo);
  }, []);

  const onRemove = useCallback((id) => {  //todo 삭제
    setTodos( todos.filter((todo) => {
      if (todo.id === id) {
        firebase.removeData(todo); //해당하는 id의 todo 삭제
        return false;
      } else return true;
    }))
  },[todos]);

  const onToggle = useCallback((id) => { //todo 변경(checked) immer 활용
    setTodos((prevTodos) =>
      produce(prevTodos, (draft) => {
        const todo = draft.find((todo) => todo.id === id);
        if (todo) {
          todo.checked = !todo.checked;
          firebase.editData(todo);
        }
      })
    );
  }, []);
  

  return (
    <div>
      <TodoTemplate>
        <TodoInsert onInsert={onInsert} />
        <TodoList todos={todos} onRemove={onRemove} onToggle={onToggle} />
      </TodoTemplate>
    </div>
  );
};

export default Todo;

// const onToggle = useCallback((id) => {  //todo 변경(checked)
  //   setTodos( todos.map((todo) => {
  //     if (todo.id === id) {
  //       const tmp = { ...todo, checked: !todo.checked };
  //       firebase.editData(tmp);
  //       return tmp;
  //     } else return todo;
  //   }))
  // },[todos]);