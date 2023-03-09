import {Message} from "element-ui";

const offset = 60

const $message = options => {
  return Message({
    ...options,
    offset,
  })
}

['success', 'warning', 'info', 'error'].forEach(type => {
  $message[type] = options => {
    if (typeof options === 'string') {
      options = {
        message: options,
        offset,
      };
    }
    options.type = type;
    return Message(options);
  };
});

$message.close = Message.close
$message.closeAll = Message.closeAll

export default $message
