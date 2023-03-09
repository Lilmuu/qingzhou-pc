export default [
  {
    name: "分组一",

    children: [
      {
        name: "1-001"
      },
      {
        name: "1-002"
      },
      {
        name: "1-003"
      }
    ]
  },
  {
    name: "分组二",

    children: [
      {
        name: "2-001",

        children: [
          {
            name: "2-001-001"
          },
          {
            name: "2-001-002"
          }
        ]
      },
      {
        name: "2-002"
      },
      {
        name: "2-003",

        children: [
          {
            name: "2-003-001"
          }
        ]
      }
    ]
  }
]

export function flatten(arr) {
  return arr.reduce(function(prev, cur) {
    var more = prev.concat(cur)
    return more.concat(cur.children ? flatten(cur.children) : [])
  }, [])
}

export function flatTree(arr) {
  let keyCounter = 0
  const flatTree = []
  function flattenChildren(node, parent) {
    node.nodeKey = keyCounter++
    flatTree[node.nodeKey] = { node: node, nodeKey: node.nodeKey }
    if (typeof parent !== "undefined") {
      flatTree[node.nodeKey].parent = parent.nodeKey
      flatTree[parent.nodeKey].children.push(node.nodeKey)
    }
    if (node.children) {
      flatTree[node.nodeKey].children = []
      node.children.forEach(child => flattenChildren(child, node))
    }
  }
  arr.forEach(rootNode => {
    flattenChildren(rootNode)
  })
  return flatTree
}
