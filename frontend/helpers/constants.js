export const emptyRegex = /^\s*$/;

export const FileSize = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
}

export const convertLocalDateTime = (dateString) => {
    try {
      var localString = "";
      // console.log("convertLocalDate")
      // console.log(dateString)
      if (dateString === null || !dateString) {
        return "-";
      }
      if (dateString?.includes(' ')) {
          var localDateString = dateString.split(' ')[0];
          const [year, month, day] = localDateString?.split('-');
          localString += `${month}/${day}/${year}`;
          var localTimeString = dateString.split(' ')[1];
          // const [hour, minute, second] = localTimeString?.split(':');
          localString += " "+localTimeString;
      }
      return localString;
    } catch (error) {
      console.error('Error converting date:', error);
      return "Invalid date";
    }
  };
