const selectPreviousOfClassName = (elem: Element, className: string) => {
  const previous = elem.previousElementSibling
  if (!previous) return undefined
  if (previous.classList.contains(className)) return previous
  return selectPreviousOfClassName(previous, className)
}
