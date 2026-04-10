const display = document.getElementById("display");

let expression = "0";
let overwrite = true;

const FUNCTION_MAP = {
  sin: "Math.sin",
  cos: "Math.cos",
  tan: "Math.tan",
  log: "Math.log10",
  ln: "Math.log",
  exp: "Math.exp",
};

function setDisplay(value) {
  if (!display) return;
  display.textContent = value;
}

function renderDisplay() {
  setDisplay(expression);
}

function isOperator(char) {
  return ["+", "-", "*", "/", "^"].includes(char);
}

function lastCharacter() {
  return expression.slice(-1);
}

function needsImplicitMultiplication(char) {
  return char === ")" || /\d/.test(char);
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return "Error";
  if (Number.isInteger(value)) return String(value);
  return parseFloat(value.toPrecision(12)).toString();
}

function clearAll() {
  expression = "0";
  overwrite = true;
  renderDisplay();
}

function backspace() {
  if (expression === "Error") {
    clearAll();
    return;
  }

  if (overwrite) return;

  expression = expression.slice(0, -1);

  if (expression === "" || expression === "-" || expression === "+" || expression === "*" || expression === "/" || expression === "^") {
    expression = "0";
    overwrite = true;
  }

  renderDisplay();
}

function inputDigit(digit) {
  if (expression === "Error") clearAll();

  if (overwrite || expression === "0") {
    expression = String(digit);
    overwrite = false;
  } else {
    expression += String(digit);
  }

  renderDisplay();
}

function inputDecimal() {
  if (expression === "Error") clearAll();

  const lastChar = lastCharacter();
  if (overwrite) {
    expression = "0.";
    overwrite = false;
    renderDisplay();
    return;
  }

  if (isOperator(lastChar) || lastChar === "(") {
    expression += "0.";
    renderDisplay();
    return;
  }

  const currentToken = expression.split(/[+\-*/^()]/).pop();
  if (!currentToken.includes(".")) {
    expression += ".";
    renderDisplay();
  }
}

function appendOperator(operator) {
  if (expression === "Error") clearAll();

  const lastChar = lastCharacter();

  if (lastChar === "Error") {
    clearAll();
  }

  if (overwrite && isOperator(lastChar)) {
    expression = expression.slice(0, -1) + operator;
    renderDisplay();
    return;
  }

  if (expression === "0" && operator !== "-") {
    return;
  }

  if (isOperator(lastChar)) {
    expression = expression.slice(0, -1) + operator;
  } else {
    expression += operator;
  }

  overwrite = true;
  renderDisplay();
}

function appendParenthesis() {
  const lastChar = lastCharacter();

  if (needsImplicitMultiplication(lastChar)) {
    expression += "*(";
  } else {
    expression += "(";
  }

  overwrite = false;
  renderDisplay();
}

function appendFunction(func) {
  if (expression === "Error") clearAll();

  const lastChar = lastCharacter();
  const functionCall = func === "√" ? "√(" : `${func}(`;

  if (needsImplicitMultiplication(lastChar) && lastChar !== "(") {
    expression += `*${functionCall}`;
  } else if (expression === "0" && overwrite) {
    expression = functionCall;
  } else {
    expression += functionCall;
  }

  overwrite = false;
  renderDisplay();
}

function sanitizeExpression(value) {
  return value
    .replace(/\^/g, "**")
    .replace(/√\(/g, "Math.sqrt(")
    .replace(/\blog\(/g, "Math.log10(")
    .replace(/\bln\(/g, "Math.log(")
    .replace(/\bexp\(/g, "Math.exp(")
    .replace(/\bsin\(/g, "Math.sin(")
    .replace(/\bcos\(/g, "Math.cos(")
    .replace(/\btan\(/g, "Math.tan(");
}

function evaluateExpression() {
  if (expression === "Error") return "Error";

  let sanitized = expression.trim();
  sanitized = sanitized.replace(/[+\-*/^]+$/, "");

  if (sanitized === "") return "0";

  sanitized = sanitizeExpression(sanitized);

  try {
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${sanitized})`)();
    return formatNumber(result);
  } catch (error) {
    return "Error";
  }
}

function handleOperator(op) {
  if (["sin", "cos", "tan", "log", "ln", "exp", "√"].includes(op)) {
    appendFunction(op);
    return;
  }

  if (op === "x^y") {
    appendOperator("^");
    return;
  }

  if (op === "(") {
    appendParenthesis();
    return;
  }

  if (op === ")") {
    const lastChar = lastCharacter();
    if (isOperator(lastChar) || lastChar === "(") return;
    expression += ")";
    overwrite = false;
    renderDisplay();
    return;
  }

  appendOperator(op);
}

function handleEquals() {
  const result = evaluateExpression();
  expression = result;
  overwrite = true;
  renderDisplay();
}

function bindButtons() {
  document.querySelectorAll("[data-digit]").forEach((btn) => {
    btn.addEventListener("click", () => inputDigit(btn.dataset.digit));
  });

  document.querySelectorAll("[data-action='decimal']").forEach((btn) => {
    btn.addEventListener("click", inputDecimal);
  });

  document.querySelectorAll("[data-action='equals']").forEach((btn) => {
    btn.addEventListener("click", handleEquals);
  });

  document.querySelectorAll("[data-action='clear']").forEach((btn) => {
    btn.addEventListener("click", clearAll);
  });

  document.querySelectorAll("[data-action='backspace']").forEach((btn) => {
    btn.addEventListener("click", backspace);
  });

  document.querySelectorAll("[data-op]").forEach((btn) => {
    btn.addEventListener("click", () => handleOperator(btn.dataset.op));
  });
}

window.addEventListener("keydown", (event) => {
  if (event.key >= "0" && event.key <= "9") {
    inputDigit(event.key);
    return;
  }

  switch (event.key) {
    case ".":
      inputDecimal();
      break;
    case "Enter":
    case "=":
      handleEquals();
      break;
    case "Backspace":
      backspace();
      break;
    case "Escape":
      clearAll();
      break;
    case "+":
    case "-":
    case "*":
    case "/":
      appendOperator(event.key);
      break;
    case "(":
      appendParenthesis();
      break;
    case ")":
      handleOperator(")");
      break;
    default:
      break;
  }
});

bindButtons();
renderDisplay();
