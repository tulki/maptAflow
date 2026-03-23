# maptAflow

**maptAflow** is a local-first desktop tool for structuring complex goals into executable trees.

It is not a generic task manager and not a “plan your whole life” app.  
Its purpose is simpler: reduce strategic and operational noise by moving structured plans out of your head and into a system that can be edited, reviewed, and executed.

## What it is

maptAflow is a desktop workspace where you build and refine tree-shaped plans.

You take a goal, break it down into branches and leaves, reorganize it when needed, and keep the structure clear enough to act on it later. The model is based on **nodes** and **edges**, where the actual executable units are **leaf nodes**.

Typical examples:

- finishing a semester
- organizing a training routine
- planning a trip
- breaking down a long technical task
- keeping several structured life domains in one place

## Why it exists

Most tools mix planning, editing, prioritization, and execution into one flat interface.  
maptAflow separates these concerns.

The idea is simple:

- **maptAflow** is where you think, decompose, and restructure
- **maptAview** is where you later track and execute what was already defined as important

This repository is focused on **maptAflow** — the desktop side of the system.

## Core idea

A complex goal is easier to manage as a tree than as a flat list.

In maptAflow:

- a file can contain multiple trees
- all trees live inside one main workspace
- additional windows act as **optics**, not as separate structures
- each window is centered around a single root node
- clicking a node can open a new window centered on that node and its descendants

This makes it possible to inspect the same structure from different points of view without duplicating data.

## Model

At the core of maptAflow is a simple tree model.

### Node

A node is the basic unit of structure.

Each node has:

- a unique ID
- a title
- optional internal text/content
- relationships to parent and child nodes
- execution-related metadata
- timestamps and other derived fields for later sorting, sync, and analytics

### Execution rule

Only **leaf nodes** are directly executable.

Non-leaf nodes are not “done” manually in the same way.  
Their maturity is derived from the state of their children.

This keeps the model stricter and avoids the usual mess where both a parent task and its subtasks are marked as active at the same time.

## Windows as optics

Windows in maptAflow are not part of the tree itself.  
They are views over the structure.

This distinction matters:

- the **tree** is the data
- the **window** is a way to inspect the data

That makes it possible to:

- keep one structure
- open many focused views
- navigate large trees without losing context
- work on different branches independently

## What maptAflow is not

maptAflow is **not**:

- a generic to-do app for everyday trivial tasks
- an attempt to perfectly model all human work
- a system optimized for instant mass-market usability
- a product built around lock-in, retention tricks, or upsell pressure

It is a structured tool for users who are willing to learn a stricter model in exchange for more clarity and control.

## Relationship to maptAview

maptAflow is the authoring environment.

After planning and structuring inside maptAflow, selected task data can be sent to **maptAview**, a lighter web-based execution layer. There, the user does not rebuild the structure again — they simply track, sort, and execute what has already been modeled.

In short:

- **maptAflow** = think and structure
- **maptAview** = review and execute

## Project goals

The goals of maptAflow are:

- reduce strategic noise
- reduce operational noise
- make complex goals easier to inspect
- keep execution grounded in an explicit structure
- provide a serious open-source artifact of software design and implementation

## Planned technical direction

The current technical direction of the project includes:

- **Rust + Tauri** for the desktop application
- **SolidJS** for UI
- **PixiJS** for graph/tree rendering and interaction
- **SQLite** for local persistence
- optional sync/server layer for integration with maptAview
- future event log and lightweight analytics based on task history

## Planned metadata and analytics

The system is intended to keep more than just current state.

Examples of useful metadata:

- creation time
- last update time
- last move/reposition time
- start time
- completion time

This opens the door for lightweight analytics such as:

- how long tasks stay inactive
- how long they stay in progress
- which branches are actually moving
- which plans are constantly restructured but never executed

## Status

This project is under active development.

The goal is not to ship a feature-bloated productivity suite, but to build a clean, usable, structurally coherent system and refine it through real use.

## Philosophy

maptAflow is intended to be a free and open tool.

The point is not to squeeze users for money.  
The point is to build something useful, honest, and technically respectable.

If a hosted sync layer exists in the future, self-hosting should remain possible.