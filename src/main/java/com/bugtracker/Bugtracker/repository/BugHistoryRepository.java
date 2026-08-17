package com.bugtracker.Bugtracker.repository;

import com.bugtracker.Bugtracker.entity.BugHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BugHistoryRepository extends JpaRepository<BugHistory, Long> {

    List<BugHistory> findByBugIdOrderByChangedAtDesc(Long bugId);
}