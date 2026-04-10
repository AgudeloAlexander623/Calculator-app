# Calculadora Científica

## Cambios realizados hoy

- Se implementó el archivo `main.mjs` con la lógica completa de la calculadora científica.
- Se corrigió el bug que hacía que los símbolos y operadores reiniciaran o borraran la entrada.
- Se añadió y validó el manejo de funciones científicas: `sin`, `cos`, `tan`, `log`, `ln`, `exp`, `x^y` y `√`.
- Se ajustó la interacción de `x^y` para convertirlo internamente en `^` y procesar correctamente la potencia.
- Se mejoró el ingreso de decimales para que funcione adecuadamente tras operadores, paréntesis y funciones.
- Se reordenó la disposición de los botones en `calc.html` para que los números y símbolos queden en un orden lógico y más fácil de usar.
- Se actualizó `estilos.css` para que la calculadora científica comparta el mismo diseño moderno que la calculadora básica.
- Se agrandó el botón `0` y se ajustó el espaciado del teclado para una mejor usabilidad.
- Se agregó un botón en `index.html` que permite ir desde la calculadora básica a la calculadora científica.
- Se validó la sintaxis de `main.mjs` con `node --check` y no presentó errores.

## Archivos modificados

- `main.mjs`
- `calc.html`
- `estilos.css`
- `index.html`
- `readme.md`

## Notas

- El código ahora maneja expresiones completas y evita entradas inválidas al escribir operadores seguidos.
- El diseño y el comportamiento de la calculadora científica están alineados con la calculadora básica para lograr consistencia visual.
