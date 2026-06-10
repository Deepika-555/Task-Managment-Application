import Task from "../models/Task.js";
import User from "../models/User.js";

export const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo } = req.body;

    let assignee = req.user._id;

    if (req.user.role === "Manager") {
      assignee = assignedTo || req.user._id;
    } else if (req.user.role === "TeamLead") {
      if (assignedTo && assignedTo !== req.user._id.toString()) {
        const isTeamMember = await User.findOne({ _id: assignedTo, teamLead: req.user._id });
        if (!isTeamMember) {
          return res.status(403).json({ message: "Can only assign tasks to self or team members" });
        }
        assignee = assignedTo;
      } else {
        assignee = req.user._id;
      }
    } else {
      assignee = req.user._id;
    }

    const task = await Task.create({
      title,
      description,
      createdBy: req.user._id,
      assignedTo: assignee,
    });

    const populatedTask = await Task.findById(task._id).populate("assignedTo", "username role");

    const io = req.app.get("io");
    if (io) {
      io.emit("taskUpdated", { action: "create", task: populatedTask });
    }

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    let tasks = [];

    if (req.user.role === "Manager") {
      tasks = await Task.find().populate("assignedTo", "username role");
    } else if (req.user.role === "TeamLead") {
      const teamMembers = await User.find({ teamLead: req.user._id }).select("_id");
      const memberIds = teamMembers.map(member => member._id);
      tasks = await Task.find({
        assignedTo: { $in: [req.user._id, ...memberIds] }
      }).populate("assignedTo", "username role");
    } else {
      tasks = await Task.find({ assignedTo: req.user._id }).populate("assignedTo", "username role");
    }

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task Not Found",
      });
    }

    if (req.user.role === "Employee") {
      if (task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Access Denied" });
      }
    } else if (req.user.role === "TeamLead") {
      if (task.assignedTo.toString() !== req.user._id.toString()) {
        const assigneeUser = await User.findById(task.assignedTo);
        if (!assigneeUser || assigneeUser.teamLead?.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: "Access Denied" });
        }
      }
    }

    task.title = req.body.title || task.title;
    task.description = req.body.description !== undefined ? req.body.description : task.description;
    task.status = req.body.status || task.status;

    if (req.user.role !== "Employee") {
      if (req.body.assignedTo) {
        let newAssignee = req.body.assignedTo;
        if (req.user.role === "TeamLead" && newAssignee !== req.user._id.toString()) {
          const isTeamMember = await User.findOne({ _id: newAssignee, teamLead: req.user._id });
          if (!isTeamMember) {
            return res.status(403).json({ message: "Can only assign tasks to self or team members" });
          }
        }
        task.assignedTo = newAssignee;
      }
    }

    const updated = await task.save();
    const populatedTask = await Task.findById(updated._id).populate("assignedTo", "username role");

    const io = req.app.get("io");
    if (io) {
      io.emit("taskUpdated", { action: "update", task: populatedTask });
    }

    res.json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task Not Found" });
    }

    if (req.user.role === "Employee") {
      if (task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Access Denied" });
      }
    } else if (req.user.role === "TeamLead") {
      if (task.assignedTo.toString() !== req.user._id.toString()) {
        const assigneeUser = await User.findById(task.assignedTo);
        if (!assigneeUser || assigneeUser.teamLead?.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: "Access Denied" });
        }
      }
    }

    await Task.findByIdAndDelete(req.params.id);

    const io = req.app.get("io");
    if (io) {
      io.emit("taskUpdated", { action: "delete", taskId: req.params.id });
    }

    res.json({
      message: "Task Deleted",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};