const newlineCleanerHelper = (str : string) : string => {
  return str.replace(/(\r\n|\r|\n|\\r\\n|\\r|\\n)/g, " ").trim();
}

export default newlineCleanerHelper;