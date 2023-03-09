/* eslint-disable import/first */
export const emojis = [
  {
    '[smile]': 'e-01.png',
    '[joy]': 'e-02.png',
    '[heart-eyes]': 'e-03.png',
    '[sweat_smile]': 'e-04.png',
    '[laughing]': 'e-05.png',
    '[wink]': 'e-06.png',
    '[yum]': 'e-07.png',
    '[relieved]': 'e-08.png',
    '[fearful]': 'e-09.png',
    '[ohYeah]': 'e-10.png',
    '[cold-sweat]': 'e-11.png',
    '[scream]': 'e-12.png',
    '[kissing_heart]': 'e-13.png',
    '[smirk]': 'e-14.png',
    '[angry]': 'e-15.png',
    '[sweat]': 'e-16.png',
    '[stuck]': 'e-17.png',
    '[rage]': 'e-18.png',
    '[etriumph]': 'e-19.png',
    '[mask]': 'e-20.png',
    '[confounded]': 'e-21.png',
    '[sunglasses]': 'e-22.png',
    '[sob]': 'e-23.png',
  },
  {
    '[blush]': 'e-24.png',
    '[doubt]': 'e-26.png',
    '[flushed]': 'e-27.png',
    '[sleepy]': 'e-28.png',
    '[sleeping]': 'e-29.png',
    '[disappointed_relieved]': 'e-30.png',
    '[tire]': 'e-31.png',
    '[astonished]': 'e-32.png',
    '[buttonNose]': 'e-33.png',
    '[frowning]': 'e-34.png',
    '[shutUp]': 'e-35.png',
    '[expressionless]': 'e-36.png',
    '[confused]': 'e-37.png',
    '[tired_face]': 'e-38.png',
    '[grin]': 'e-39.png',
    '[unamused]': 'e-40.png',
    '[persevere]': 'e-41.png',
    '[relaxed]': 'e-42.png',
    '[pensive]': 'e-43.png',
    '[no_mouth]': 'e-44.png',
    '[worried]': 'e-45.png',
    '[cry]': 'e-46.png',
    '[pill]': 'e-47.png',
  },
  {
    '[celebrate]': 'e-48.png',
    '[gift]': 'e-49.png',
    '[birthday]': 'e-50.png',
    '[paray]': 'e-51.png',
    '[ok_hand]': 'e-52.png',
    '[first]': 'e-53.png',
    '[v]': 'e-54.png',
    '[punch]': 'e-55.png',
    '[thumbsup]': 'e-56.png',
    '[thumbsdown]': 'e-57.png',
    '[muscle]': 'e-58.png',
    '[maleficeent]': 'e-59.png',
    '[broken_heart]': 'e-60.png',
    '[heart]': 'e-61.png',
    '[taxi]': 'e-62.png',
    '[eyes]': 'e-63.png',
    '[rose]': 'e-64.png',
    '[ghost]': 'e-65.png',
    '[lip]': 'e-66.png',
    '[fireworks]': 'e-67.png',
    '[balloon]': 'e-68.png',
    '[clasphands]': 'e-69.png',
    '[bye]': 'e-70.png',
  }
]

/**
 * 把emojis转为一个数组
 * @return  {Array}
 * */
export const getEmojiList = () => {
  let emojisList = []
  for (let i = 0; i < emojis.length; i++) {
    for (let key in emojis[i]) {
      const value = emojis[i][key]
      emojisList.push({ key, value })
    }
  }
  return emojisList
}

/**
 * 根据value得到emoji的key
 * @param   value   {String}
 * @return  {String}
 */
export const getEmojiName = (value) => {
  let emojiKey = ''
  for (let i = 0; i < emojis.length; i++) {
    for (let key in emojis[i]) {
      if (emojis[i][key] === value) {
        emojiKey = key
      }
    }
  }
  return emojiKey
}

/**
 * 根据key得到emoji的value
 * @param   value   {String}
 * @return  {String}
 */
 export const getEmojiValue = (value) => {
  let emojiKey = value
  for (let i = 0; i < emojis.length; i++) {
    for (let key in emojis[i]) {
      if (key === value) {
        emojiKey = emojis[i][key]
      }
    }
  }
  return emojiKey
}

export const gifs = [
  ['eight.gif', 'eighteen.gif', 'eleven.gif', 'fifity.gif', 'fifity_four.gif', 'fifity_one.gif', 'fifity_three.gif', 'fifity_two.gif', 'fifteen.gif', 'five.gif'],
  ['forty.gif', 'forty_eight.gif', 'forty_five.gif', 'forty_four.gif', 'forty_nine.gif', 'forty_one.gif', 'forty_seven.gif', 'forty_three.gif', 'forty_two.gif', 'fourteen.gif'],
  ['nine.gif', 'nineteen.gif', 'one.gif', 'seven.gif', 'seventeen.gif', 'sixteen.gif', 'ten.gif', 'thirteen.gif', 'thirty.gif', 'thirty_eight.gif'],
  ['thirty_five.gif', 'thirty_four.gif', 'thirty_nine.gif', 'thirty_seven.gif', 'thirty_six.gif', 'thirty_three.gif', 'thirty_two.gif', 'thirty-one.gif', 'three.gif', 'twelve.gif'],
  ['twenty.gif', 'twenty_eight.gif', 'twenty_five.gif', 'twenty_four.gif', 'twenty_nine.gif', 'twenty_one.gif', 'twenty_seven.gif', 'twenty_six.gif', 'twenty_three.gif', 'twenty_two.gif']
]

export default { emojis, gifs }
