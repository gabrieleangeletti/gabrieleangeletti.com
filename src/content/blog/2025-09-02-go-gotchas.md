---
title: Go Gotchas
slug: go-gotchas
excerpt: A list of common patterns, idioms, and pitfalls I've encountered during my journey with Go.
author: Gabriele Angeletti
timestamp: 2025-09-02
lastUpdated: 2025-09-09
status: published
type: live
tableOfContents: true
tags: [software-engineering, golang]
---

### Arrays

Arrays are values, not references. Assigning an array copies the whole thing. Perhaps not intuitive if coming from languages such as Java.

```go
a := [2]int{1, 2}
b := a
b[0] = 9
fmt.Println(a) // [1, 2], unchanged
```

Deciding if an array goes into the stack or heap is based on escape analysis. An array of primitive types that is passed around in multiple functions, i.e. “escapes” the scope of a single function, gets allocated in the heap.

### Slices

Slices share memory: creating a sub-slice points to the same underlying array. Modifying it modifies the original.

```go
a := []int{1, 2, 3, 4}
b := a[1:2]
b[0] = 9
fmt.Println(a) // [1, 9, 3, 4]
```

### Maps

- Go randomises iteration order for maps to prevent relying on a deterministic order, e.g. insertion order. One should never rely on a deterministic iteration order for maps. But some languages do have a deterministic order in practice, e.g. dictionaries in Python.
- When iterating a map, a snapshot of the buckets is taken to define the iteration space. Newly added keys may or may not be seen during iterations, it’s not guaranteed. Deleted entries may still be returned, with their zero value. Concurrency updates panic at runtime - e.g. iterating in one goroutine while modifying in another one.
- Use `sync.Mutex` or `sync.RWMutex` to add thread-safety to map read/write operations (or :
```go
type Foo[T any] struct {
  data map[string]T
  mu sync.Mutex
}

func (f *Foo[T]) write(key string, value T) {
  f.mu.Lock()
  defer f.mu.Unlock()
  f.data[key] = value
} 
```

- peek pattern to polymorphically unmarshal json
  var peek struct {
  Kind string `json:"kind"`
  }
  \_ = json.Unmarshal(raw, &peek)

- An interface value is a pair (dynamic type, dynamic value). For an interface to be nil, both need to be nil, e.g.:

```go
func main() {
	var p *int = nil
	fmt.Println(p == nil)     // prints true because this only compares the value
	fmt.Println(foo() == nil) // prints false because foo() returns an interface with (type != nil, value == nil), which is `!= nil`
}

func foo() error {
	var p *X = nil
	return p
}

type X struct{}

func (x X) Error() string {
	return "X"
}
```

A pointer is not a reference type per se, but a value type holding a memory address. Passing a pointer copies the address, which is why it behaves like a reference.

- To verify that a type implements an interface at compile time:

```go
var _ Foo = (*X)(nil) // asserts *X implements Foo (blank identifier assignment)
```

Useful links:

- [Stack or Heap? Going Deeper with Escape Analysis in Go for Better Performance](https://syntactic-sugar.dev/blog/nested-route/go-escape-analysis) (May 2024)
