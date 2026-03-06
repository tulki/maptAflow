# maptAflow — Technical Documentation

## Purpose

Этот документ описывает техническую архитектуру системы maptAflow.

Документ фиксирует:

- структуру системы
- ответственность модулей
- правила графа
- модель взаимодействия пользователя
- модель рендера

Цель документа — чтобы разработчик мог быстро понять архитектуру проекта.

---

# System Overview

maptAflow является пространственным графовым редактором задач.

Основные подсистемы системы:

1. Graph Model
2. Rendering System
3. Input System
4. UI Integration Layer
5. Persistence Layer (будущий этап)

---

# High-Level Architecture

User Input  
↓  
Input System  
↓  
Graph Actions  
↓  
Graph Model  
↓  
Render System  
↓  
PixiJS

Graph Model является источником истины для структуры задач.

---

# Source Structure

src/
  components/
    PixiCanvas.tsx

  core/
    constants.ts
    index.ts

    graph/
      types.ts
      rules.ts
      actions.ts

    render/
      scene.ts
      nodes.ts
      links.ts

    input/
      drag.ts
      pan.ts

---

# Component Responsibilities

## PixiCanvas

Файл:

components/PixiCanvas.tsx

PixiCanvas отвечает за:

- создание Pixi приложения
- инициализацию сцены
- подключение input систем
- запуск render ticker
- управление lifecycle

PixiCanvas не содержит логики графа.  
Он связывает модули системы.

---

# Core Layer

Папка:

src/core

Core содержит основную логику движка.

Подсистемы:

- Graph
- Render
- Input

---

# Graph System

Папка:

core/graph

Graph System отвечает за:

- структуру узлов
- правила графа
- операции изменения графа

---

## Graph Types

Файл:

graph/types.ts

### NodeModel

NodeModel содержит:

- view (PIXI.Graphics)
- parent
- children

В текущем MVP модель напрямую содержит ссылку на Pixi объект.

В будущем модель будет разделена на:

NodeData — данные  
NodeView — визуальное представление

---

### LinkModel

LinkModel содержит:

- parent node
- child node
- line (PIXI.Graphics)

Связь представляет направленное ребро.

---

# Graph Rules

Файл:

graph/rules.ts

Основные ограничения графа:

1. Узел не может быть родителем самого себя
2. Узел не может стать родителем своего предка
3. У узла может быть только один родитель

Эти правила предотвращают появление циклов.

---

# Graph Actions

Файл:

graph/actions.ts

Actions изменяют структуру графа.

Основные операции:

- setParent()
- removeChildFromParent()
- removeExistingLinkToChild()

Actions слой отвечает за изменение структуры графа.

---

# Render System

Папка:

core/render

Render System отвечает за визуализацию графа.

---

## Scene

Файл:

render/scene.ts

Создаёт структуру сцены.

stage
└── world
    ├── linksLayer
    └── nodesLayer

world — контейнер, который перемещается при pan.

---

## Node Rendering

Файл:

render/nodes.ts

Отвечает за:

- создание нод
- добавление их в сцену
- настройку визуального представления

Каждая нода представлена объектом PIXI.Graphics.

---

## Link Rendering

Файл:

render/links.ts

Отвечает за:

- отрисовку линий
- позиционирование стрелок
- обновление геометрии связей

Связи обновляются каждый кадр через ticker.

---

# Input System

Папка:

core/input

Input System обрабатывает пользовательские взаимодействия.

---

## Pan Controller

Файл:

input/pan.ts

Управление холстом:

MMB + drag → pan world

Pan изменяет позицию контейнера world.

---

## Drag Controller

Файл:

input/drag.ts

Отвечает за:

- drag нод
- вычисление позиции курсора
- поиск кандидата на связь
- создание связи

Алгоритм:

1. пользователь начинает drag
2. нода следует за курсором
3. при отпускании ищется ближайшая нода
4. если расстояние меньше threshold — создаётся связь

---

# Canvas Model

Система использует infinite canvas.

Viewport отображает только часть пространства.

Координаты нод находятся в координатах world.

---

# Link Geometry

Линия связи:

1. начинается у края родительской ноды
2. заканчивается у края дочерней ноды
3. стрелка располагается рядом с дочерней нодой

Это предотвращает наложение линий на центры нод.

---

# Node Creation

Новая нода создаётся в центре текущего viewport.

Это обеспечивает предсказуемое поведение интерфейса.

---

# Performance Model

Текущий MVP использует модель:

Pixi ticker → updateLinks()

Каждый кадр обновляет положение связей.

---

# Persistence Layer (Future)

Данные будут храниться в SQLite.

Планируемые таблицы:

nodes  
links  
files

---

# Planned Improvements

- разделение NodeData и NodeView
- spatial indexing
- zoom navigation
- collision avoidance
- graph persistence

---

# Current Technical Goal

Цель текущего этапа разработки — создать устойчивый Graph Engine, который поддерживает:

- infinite canvas
- directed task graph
- drag нод
- linking нод
- pan navigation