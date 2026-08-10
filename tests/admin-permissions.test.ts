import assert from "node:assert/strict";
import test from "node:test";
import {
  hasAdminRole,
  MANAGER_ROLES,
  SUPER_ADMIN_ROLES,
  VIEWER_ROLES,
} from "../src/lib/admin-permissions";

test("all admin roles can view admin data", () => {
  for (const role of ["SUPER_ADMIN", "ADMIN", "EDITOR"]) {
    assert.equal(hasAdminRole(role, VIEWER_ROLES), true);
  }
});

test("editors cannot perform business operations", () => {
  assert.equal(hasAdminRole("EDITOR", MANAGER_ROLES), false);
  assert.equal(hasAdminRole("ADMIN", MANAGER_ROLES), true);
  assert.equal(hasAdminRole("SUPER_ADMIN", MANAGER_ROLES), true);
});

test("only super admins can change sensitive configuration", () => {
  assert.equal(hasAdminRole("SUPER_ADMIN", SUPER_ADMIN_ROLES), true);
  assert.equal(hasAdminRole("ADMIN", SUPER_ADMIN_ROLES), false);
  assert.equal(hasAdminRole("EDITOR", SUPER_ADMIN_ROLES), false);
  assert.equal(hasAdminRole(undefined, SUPER_ADMIN_ROLES), false);
});
