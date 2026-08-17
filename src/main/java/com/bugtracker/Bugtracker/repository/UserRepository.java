package com.bugtracker.Bugtracker.repository;

import com.bugtracker.Bugtracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

}