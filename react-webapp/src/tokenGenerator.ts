export function generate_token(length) {
  //edit the token allowed characters
  var a: any = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("")
  var b: any = []
  for (var i = 0; i < length; i++) {
    var j = (Math.random() * (a.length - 1)).toFixed(0)
    b[i] = a[j]
  }
  return b.join("")
}
