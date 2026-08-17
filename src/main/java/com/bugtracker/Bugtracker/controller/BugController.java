package com.bugtracker.Bugtracker.controller;

import com.bugtracker.Bugtracker.entity.Bug;
import com.bugtracker.Bugtracker.entity.BugHistory;
import com.bugtracker.Bugtracker.service.BugService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bugs")
@CrossOrigin(origins = "*")
public class BugController {

    private final BugService bugService;

    public BugController(BugService bugService) {
        this.bugService = bugService;
    }

    @PostMapping
    public Bug createBug(@RequestBody Bug bug) {
        return bugService.createBug(bug);
    }

    @GetMapping
    public List<Bug> getAllBugs() {
        return bugService.getAllBugs();
    }

    @GetMapping("/{id}")
    public Bug getBugById(@PathVariable Long id) {
        return bugService.getBugById(id);
    }

    @DeleteMapping("/{id}")
    public String deleteBug(@PathVariable Long id) {
        bugService.deleteBug(id);
        return "Bug deleted successfully";
    }

    @PutMapping("/{bugId}/assign/{userId}")
    public Bug assignBug(
            @PathVariable Long bugId,
            @PathVariable Long userId) {

        return bugService.assignBug(bugId, userId);
    }

    @PutMapping("/{id}/status")
    public Bug updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        return bugService.updateStatus(id, status);
    }

    @PutMapping("/{id}/priority")
    public Bug updatePriority(
            @PathVariable Long id,
            @RequestParam String priority) {

        return bugService.updatePriority(id, priority);
    }

    @PutMapping("/{id}")
    public Bug updateBug(
            @PathVariable Long id,
            @RequestBody Bug bug) {

        return bugService.updateBug(id, bug);
    }

    @GetMapping("/{id}/history")
    public List<BugHistory> getBugHistory(@PathVariable Long id) {
        return bugService.getBugHistory(id);
    }
}