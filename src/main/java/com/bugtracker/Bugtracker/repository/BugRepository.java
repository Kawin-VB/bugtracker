package com.bugtracker.Bugtracker.repository;

import com.bugtracker.Bugtracker.entity.Bug;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BugRepository extends JpaRepository<Bug, Long> {

    Optional<Bug> findByTitleAndDescription(String title, String description);
}