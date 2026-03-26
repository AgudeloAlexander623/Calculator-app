
const display = document.getElementById("display");

// Estado interno de la calculadora
// - current: lo que se esta mostrando (como string para permitir "0." temporal)
// - previous: numero anterior ya convertido a Number (se usa al presionar operadores)
// - operator: "+", "-", "*", "/"
// - overwrite: si es true, el proximo digito reemplaza `current` (nuevo numero)
let current = "0";
let previous = null;
let operator = null;
let overwrite = true;

// Actualiza visualmente la pantalla
function setDisplay(value) {
  // Guard por si el HTML no cargara el elemento #display (evita errores en consola).
  if (!display) return;
  display.textContent = value;
}

// Renderiza la pantalla segun el estado actual:
// - Si hay operador y overwrite=true: muestra "prev op" (ej: "7 +")
// - Si hay operador y overwrite=false: muestra "prev op current" (ej: "7 + 3")
// - Si no hay operador: muestra solo current (ej: "12", o el resultado del "=")
function renderDisplay() {
  if (current === "Error") {
    setDisplay("Error");
    return;
  }

  if (operator && previous !== null) {
    const left = formatNumber(previous);
    if (overwrite) setDisplay(`${left} ${operator}`);
    else setDisplay(`${left} ${operator} ${current}`);
    return;
  }

  setDisplay(current);
}

// Da un formato "bonito" para flotantes y controla errores (NaN/Infinity)
function formatNumber(n) {
  // Si la operacion produce algo no finito (NaN/Infinity) mostramos "Error"
  if (!Number.isFinite(n)) return "Error";

  // Si es entero, lo mostramos tal cual
  if (Number.isInteger(n)) return String(n);

  // Si es decimal, recortamos ruido usando precision y convirtiendo a string
  return parseFloat(n.toPrecision(12)).toString();
}

// Resetea toda la calculadora (modo "limpio")
function clearAll() {
  current = "0";
  previous = null;
  operator = null;
  overwrite = true;
  renderDisplay();
}

// Borra un digito atras en el numero actual (backspace "←")
function backspace() {
  // Si estamos en error, cualquier backspace limpia todo
  if (current === "Error") {
    clearAll();
    return;
  }

  // Si aun no empezamos a escribir un nuevo numero despues de un operador,
  // no tiene sentido borrar; por eso no hacemos nada.
  if (overwrite) return;

  // El numero actual se borra caracter por caracter (string)
  if (current.length <= 1) {
    current = "0";
  } else {
    current = current.slice(0, -1);
    // Casos raros: si queda solo "-" o queda vacio, volvemos a 0
    if (current === "-" || current === "") current = "0";
  }

  renderDisplay();
}

// Mete un digito (0-9) en el numero actual
function inputDigit(digit) {
  // Si venimos de un error, empezamos de cero
  if (current === "Error") clearAll();

  if (overwrite) {
    // Despues de presionar un operador o "=", iniciamos un nuevo numero
    current = String(digit);
    overwrite = false;
  } else {
    // Si el current es "0", reemplazamos en vez de concatenar
    if (current === "0") current = String(digit);
    else current += String(digit);
  }

  renderDisplay();
}

// Agrega un punto decimal, evitando que haya dos "."
function inputDecimal() {
  // Si venimos de un error, empezamos de cero
  if (current === "Error") clearAll();

  if (overwrite) {
    // Si el usuario presiona "." justo despues de un operador, comenzamos con "0."
    current = "0.";
    overwrite = false;
    renderDisplay();
    return;
  }

  // Solo agregamos "." si aun no existe en current
  if (!current.includes(".")) {
    current += ".";
    renderDisplay();
  }
}

// Computa la operacion basica entre dos numeros
function compute(a, b, op) {
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "*":
      return a * b;
    case "/":
      // Division por cero: devolvemos NaN, luego formatNumber lo convertira a "Error"
      return b === 0 ? Number.NaN : a / b;
    default:
      return Number.NaN;
  }
}

// Maneja cuando presionas un operador (+, -, *, /)
function handleOperator(nextOp) {
  // Si ya estabamos en "Error", primero reseteamos
  if (current === "Error") clearAll();

  // Caso: usuario presiona operadores consecutivos.
  // Si overwrite esta activo, significa que no hay un segundo numero nuevo,
  // entonces solo cambiamos el operador.
  if (operator && overwrite) {
    operator = nextOp;
    renderDisplay();
    return;
  }

  // Convertimos el numero actual (string) a Number para operar
  const inputNumber = parseFloat(current);

  // Si es la primera vez, guardamos el previous
  if (previous === null) {
    previous = inputNumber;
  } else if (operator) {
    // Si ya habia un operador, calculamos: previous (operador) inputNumber
    const result = compute(previous, inputNumber, operator);
    const formatted = formatNumber(result);

    current = formatted;

    // Si dio "Error", detenemos el estado y quedamos listos para que el siguiente
    // input limpie automaticamente.
    if (formatted === "Error") {
      previous = null;
      operator = null;
      overwrite = true;
      renderDisplay();
      return;
    }

    // Si todo bien, guardamos el resultado como nuevo previous
    previous = parseFloat(current);
  }

  // Actualizamos el operador y marcamos que el proximo digito iniciara un numero nuevo
  operator = nextOp;
  overwrite = true;
  renderDisplay();
}

// Maneja el "=": calcula previous (operator) current
function handleEquals() {
  // Si no hay operador, no hacemos nada (evita NaN y estados raros)
  if (!operator) return;
  if (current === "Error") return;

  const inputNumber = parseFloat(current);
  const result = compute(previous, inputNumber, operator);
  const formatted = formatNumber(result);

  current = formatted;

  // Despues de "=", reseteamos previous/operator y dejamos overwrite=true
  // para que el siguiente digito empiece un nuevo calculo.
  previous = null;
  operator = null;
  overwrite = true;
  renderDisplay();
}

// ============ Eventos de botones ============
// Cada boton tiene atributos data-* y aqui traducimos esos clics a funciones:
// - data-digit: agrega un numero (inputDigit)
// - data-action='decimal': agrega punto (inputDecimal)
// - data-action='equals': calcula (handleEquals)
// - data-action='clear': limpia todo (clearAll)
// - data-action='backspace': borra un digito (backspace)
// - data-op: guarda el operador (+ - * /) (handleOperator)
document.querySelectorAll("[data-digit]").forEach((btn) => {
  // Callback: cuando clickeas un digito, usamos el data-digit del boton.
  btn.addEventListener("click", () => inputDigit(btn.dataset.digit));
});

document.querySelectorAll("[data-action='decimal']").forEach((btn) => {
  // Callback: agrega un decimal al numero actual.
  btn.addEventListener("click", () => inputDecimal());
});

document.querySelectorAll("[data-action='equals']").forEach((btn) => {
  // Callback: ejecuta el calculo con current/operator.
  btn.addEventListener("click", () => handleEquals());
});

document.querySelectorAll("[data-action='clear']").forEach((btn) => {
  // Callback: resetea todo a 0.
  btn.addEventListener("click", () => clearAll());
});

document.querySelectorAll("[data-action='backspace']").forEach((btn) => {
  // Callback: borra el ultimo caracter del numero actual.
  btn.addEventListener("click", () => backspace());
});

document.querySelectorAll("[data-op]").forEach((btn) => {
  // Callback: guarda/cambia el operador que presionaste.
  btn.addEventListener("click", () => handleOperator(btn.dataset.op));
});

// Estado inicial por si el HTML no trae el display listo.
renderDisplay();

// (Opcional) teclado:
// - 0-9: input de digitos
// - '.': decimal
// - + - * /: operador
// - Enter o '=': igual
// - Backspace: borra
// - Escape: limpiar
window.addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") inputDigit(e.key);
  else if (e.key === ".") inputDecimal();
  else if (e.key === "Enter" || e.key === "=") handleEquals();
  else if (e.key === "Backspace") backspace();
  else if (e.key === "Escape") clearAll();
  else if (e.key === "+" || e.key === "-" || e.key === "*" || e.key === "/") handleOperator(e.key);
});