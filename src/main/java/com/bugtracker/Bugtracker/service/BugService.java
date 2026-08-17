package com.bugtracker.Bugtracker.service;

import com.bugtracker.Bugtracker.entity.Bug;
import com.bugtracker.Bugtracker.entity.BugHistory;
import com.bugtracker.Bugtracker.entity.User;
import com.bugtracker.Bugtracker.repository.BugHistoryRepository;
import com.bugtracker.Bugtracker.repository.BugRepository;
import com.bugtracker.Bugtracker.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BugService {

    private final BugRepository bugRepository;
    private final UserRepository userRepository;
    private final BugHistoryRepository bugHistoryRepository;

    public BugService(BugRepository bugRepository,
                      UserRepository userRepository,
                      BugHistoryRepository bugHistoryRepository) {

        this.bugRepository = bugRepository;
        this.userRepository = userRepository;
        this.bugHistoryRepository = bugHistoryRepository;
    }

    public Bug createBug(Bug bug) {

        Optional<Bug> existingBug =
                bugRepository.findByTitleAndDescription(
                        bug.getTitle(),
                        bug.getDescription()
                );

        if (existingBug.isPresent()) {
            throw new RuntimeException("Duplicate bug already exists");
        }

        Bug savedBug = bugRepository.save(bug);

        BugHistory history = new BugHistory();
        history.setBug(savedBug);
        history.setAction("BUG_CREATED");
        history.setOldValue(null);
        history.setNewValue(savedBug.getTitle());
        history.setChangedAt(LocalDateTime.now());

        bugHistoryRepository.save(history);

        return savedBug;
    }

    public List<Bug> getAllBugs() {
        return bugRepository.findAll();
    }

    public Bug getBugById(Long id) {
        return bugRepository.findById(id).orElse(null);
    }

    public void deleteBug(Long id) {
        Bug bug = bugRepository.findById(id).orElse(null);

        if (bug == null) {
            throw new RuntimeException("Bug not found");
        }

        bugRepository.deleteById(id);
    }

    public Bug assignBug(Long bugId, Long userId) {

        Bug bug = bugRepository.findById(bugId).orElse(null);
        User user = userRepository.findById(userId).orElse(null);

        if (bug == null) {
            throw new RuntimeException("Bug not found");
        }

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        bug.setAssignedTo(user);

        Bug savedBug = bugRepository.save(bug);

        BugHistory history = new BugHistory();
        history.setBug(savedBug);
        history.setAction("BUG_ASSIGNED");
        history.setOldValue(null);
        history.setNewValue(user.getName());
        history.setChangedAt(LocalDateTime.now());

        bugHistoryRepository.save(history);

        return savedBug;
    }

    public Bug updateStatus(Long id, String status) {

        Bug bug = bugRepository.findById(id).orElse(null);

        if (bug == null) {
            throw new RuntimeException("Bug not found");
        }

        String oldStatus = bug.getStatus();

        bug.setStatus(status);

        Bug savedBug = bugRepository.save(bug);

        BugHistory history = new BugHistory();
        history.setBug(savedBug);
        history.setAction("STATUS_CHANGED");
        history.setOldValue(oldStatus);
        history.setNewValue(status);
        history.setChangedAt(LocalDateTime.now());

        bugHistoryRepository.save(history);

        return savedBug;
    }

    public Bug updatePriority(Long id, String priority) {

        Bug bug = bugRepository.findById(id).orElse(null);

        if (bug == null) {
            throw new RuntimeException("Bug not found");
        }

        String oldPriority = bug.getPriority();

        bug.setPriority(priority);

        Bug savedBug = bugRepository.save(bug);

        BugHistory history = new BugHistory();
        history.setBug(savedBug);
        history.setAction("PRIORITY_CHANGED");
        history.setOldValue(oldPriority);
        history.setNewValue(priority);
        history.setChangedAt(LocalDateTime.now());

        bugHistoryRepository.save(history);

        return savedBug;
    }

    public Bug updateBug(Long id, Bug bug) {

        Bug existingBug = bugRepository.findById(id).orElse(null);

        if (existingBug == null) {
            throw new RuntimeException("Bug not found");
        }

        String oldTitle = existingBug.getTitle();
        String oldDescription = existingBug.getDescription();
        String oldPriority = existingBug.getPriority();
        String oldStatus = existingBug.getStatus();

        existingBug.setTitle(bug.getTitle());
        existingBug.setDescription(bug.getDescription());
        existingBug.setPriority(bug.getPriority());
        existingBug.setStatus(bug.getStatus());

        Bug savedBug = bugRepository.save(existingBug);

        BugHistory history = new BugHistory();
        history.setBug(savedBug);
        history.setAction("BUG_UPDATED");
        history.setOldValue(
                "Title: " + oldTitle +
                ", Description: " + oldDescription +
                ", Priority: " + oldPriority +
                ", Status: " + oldStatus
        );
        history.setNewValue(
                "Title: " + bug.getTitle() +
                ", Description: " + bug.getDescription() +
                ", Priority: " + bug.getPriority() +
                ", Status: " + bug.getStatus()
        );
        history.setChangedAt(LocalDateTime.now());

        bugHistoryRepository.save(history);

        return savedBug;
    }

    public List<BugHistory> getBugHistory(Long bugId) {
        return bugHistoryRepository.findByBugIdOrderByChangedAtDesc(bugId);
    }
}